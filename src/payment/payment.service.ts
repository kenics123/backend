import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  Registration,
  RegistrationDocument,
} from 'src/registration/schema/registration.schema';
import { FlutterwaveResponse, FlutterwaveWebhookEvent } from 'src/types/types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {
    this.secretKey =
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY') || '';
    this.baseUrl = (
      this.configService.get<string>('FLUTTERWAVE_BASE_URL') || ''
    ).replace(/\/+$/, '');
    this.webhookSecret = (
      this.configService.get<string>('WEBHOOK_SECRET') || ''
    ).trim();
  }

  assertValidWebhookSignature(rawBody: Buffer, signature?: string): void {
    if (!this.webhookSecret) {
      throw new HttpException(
        'Webhook is not configured. Set WEBHOOK_SECRET.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!signature?.trim()) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const trimmed = signature.trim();

    // Flutterwave secret hash (verif-hash) — plain equality
    if (this.timingSafeEqual(trimmed, this.webhookSecret)) {
      return;
    }

    // Newer Flutterwave signature — HMAC of raw body
    const mac = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('base64');

    const macHex = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const ok =
      this.timingSafeEqual(trimmed, mac) ||
      this.timingSafeEqual(trimmed, macHex);

    if (!ok) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  private timingSafeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a, 'utf8');
    const right = Buffer.from(b, 'utf8');
    if (left.length !== right.length) {
      return false;
    }
    return crypto.timingSafeEqual(left, right);
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    tx_ref: string;
    payment_options: string;
    redirect_url: string;
    customer: {
      name?: string;
      email: string;
      phonenumber?: string;
    };
    customizations: {
      title: string;
    };
    meta: Record<string, string>;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as FlutterwaveResponse;

      if (!response.ok) {
        throw new HttpException(
          result?.message || 'Payment initiation failed',
          response.status,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initiate payment';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const result = (await response.json()) as FlutterwaveResponse;

      if (!response.ok) {
        throw new HttpException(
          result?.message || 'Payment verification failed',
          response.status,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify payment';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPaymentByReference(txRef: string) {
    try {
      const encodedRef = encodeURIComponent(txRef.trim());
      const response = await fetch(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodedRef}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const result = (await response.json()) as FlutterwaveResponse;

      if (!response.ok) {
        throw new HttpException(
          result?.message || 'Payment verification failed',
          response.status,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify payment';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async webHookPayment(data: FlutterwaveWebhookEvent) {
    const txRefs = this.extractTxRefs(data);
    this.logger.log(`Webhook refs: ${JSON.stringify(txRefs)}`);

    if (txRefs.length === 0) {
      this.logger.warn('Webhook ignored: missing_tx_ref');
      return { received: true, ignored: true, reason: 'missing_tx_ref' };
    }

    let registration: RegistrationDocument | null = null;
    for (const ref of txRefs) {
      registration = await this.registrationModel.findOne({ paymentRef: ref });
      if (registration) {
        break;
      }
    }

    if (!registration) {
      this.logger.warn(
        `Webhook skipped: no registration for refs=${JSON.stringify(txRefs)}`,
      );
      return { received: true, skipped: true, reason: 'unknown_tx_ref' };
    }

    this.logger.log(
      `Webhook matched registration email=${registration.email} paymentRef=${registration.paymentRef} currentStatus=${registration.paymentStatus}`,
    );

    if (this.isPaidStatus(registration.paymentStatus)) {
      this.logger.log(
        `Webhook skipped: already_paid paymentRef=${registration.paymentRef}`,
      );
      return { received: true, skipped: true, reason: 'already_paid' };
    }

    this.logger.log(
      `Verifying with Flutterwave by reference: ${registration.paymentRef}`,
    );
    const verified = await this.verifyPaymentByReference(
      registration.paymentRef,
    );
    this.logger.log(
      `Flutterwave verify result: status=${verified.status} message=${verified.message} data.status=${verified.data?.status} payment_type=${verified.data?.payment_type}`,
    );

    if (!this.isVerifyResponseSuccessful(verified.status)) {
      this.logger.warn(
        `Webhook verify failed: paymentRef=${registration.paymentRef} status=${verified.status}`,
      );
      return {
        received: true,
        verified: false,
        message: verified.message,
      };
    }

    const verifiedStatus = String(verified.data?.status ?? '').toLowerCase();
    registration.paymentStatus = verifiedStatus || 'failed';
    await registration.save();

    this.logger.log(
      `Webhook processed: paymentRef=${registration.paymentRef} paymentStatus=${registration.paymentStatus} paymentType=${verified.data?.payment_type}`,
    );

    return {
      received: true,
      processed: true,
      paymentStatus: registration.paymentStatus,
      paymentType: verified.data?.payment_type,
    };
  }

  private extractTxRefs(event: FlutterwaveWebhookEvent): string[] {
    const refs = new Set<string>();
    const add = (value: unknown) => {
      if (typeof value !== 'string') {
        return;
      }
      const trimmed = value.trim();
      if (trimmed) {
        refs.add(trimmed);
      }
    };

    const payload = event?.data as unknown as
      | Record<string, unknown>
      | undefined;
    add(payload?.tx_ref);
    add(payload?.txRef);
    add(payload?.reference);

    const raw = event as FlutterwaveWebhookEvent & Record<string, unknown>;
    add(raw.tx_ref);
    add(raw.txRef);
    add(raw.reference);

    return [...refs];
  }

  private isVerifyResponseSuccessful(status: unknown): boolean {
    return (
      String(status ?? '')
        .trim()
        .toLowerCase() === 'success'
    );
  }

  private isPaidStatus(status: unknown): boolean {
    return ['successful', 'success', 'succeeded'].includes(
      String(status ?? '')
        .trim()
        .toLowerCase(),
    );
  }
}
