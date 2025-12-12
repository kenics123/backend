import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from 'src/registration/schema/registration.schema';
import { FlutterwaveResponse, FlutterwaveWebhookEvent } from 'src/types/types';

@Injectable()
export class PaymentService {
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
  ) {
    this.secretKey =
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY') || '';
    this.baseUrl = this.configService.get<string>('FLUTTERWAVE_BASE_URL') || '';
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
    meta: {
      type: string;
    };
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

  async webHookPayment(data: FlutterwaveWebhookEvent) {
    if (data.meta_data?.type === 'Registration') {
      const registration = await this.registrationModel.findOne({
        paymentRef: data.data.tx_ref,
      });

      if (registration) {
        registration.paymentStatus = data.data.status;
        await registration.save();
      }
    }
  }
}
