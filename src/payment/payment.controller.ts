import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { FlutterwaveWebhookEvent } from 'src/types/types';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webHookPayment(
    @Req()
    req: {
      rawBody?: Buffer;
      headers: Record<string, string | string[] | undefined>;
    },
  ) {
    this.logger.log('Webhook hit: POST /payment/webhook');

    const rawBody = req.rawBody;
    if (!Buffer.isBuffer(rawBody)) {
      this.logger.error('Webhook rejected: raw body missing');
      throw new BadRequestException(
        'Raw body required for webhook verification.',
      );
    }

    const signatureHeader =
      req.headers['flutterwave-signature'] ?? req.headers['verif-hash'];
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    try {
      this.paymentService.assertValidWebhookSignature(
        rawBody,
        typeof signature === 'string' ? signature : undefined,
      );
    } catch (error) {
      this.logger.warn(
        `Webhook rejected: invalid signature (${error instanceof Error ? error.message : String(error)})`,
      );
      throw error;
    }

    let payload: FlutterwaveWebhookEvent;
    try {
      payload = JSON.parse(rawBody.toString('utf8')) as FlutterwaveWebhookEvent;
    } catch {
      this.logger.error('Webhook rejected: invalid JSON body');
      throw new BadRequestException('Invalid webhook JSON body.');
    }

    this.logger.log(
      `Webhook inbound: event=${payload.event ?? 'unknown'} event.type=${payload['event.type'] ?? 'unknown'}`,
    );

    const result = await this.paymentService.webHookPayment(payload);
    this.logger.log(`Webhook response: ${JSON.stringify(result)}`);
    return result;
  }
}
