import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { FlutterwaveWebhookEvent } from 'src/types/types';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webHookPayment(@Body() data: FlutterwaveWebhookEvent) {
    this.logger.log(
      `Webhook hit: event=${data?.event ?? 'unknown'} event.type=${data?.['event.type'] ?? 'unknown'}`,
    );
    const result = await this.paymentService.webHookPayment(data);
    this.logger.log(`Webhook response: ${JSON.stringify(result)}`);
    return result;
  }
}
