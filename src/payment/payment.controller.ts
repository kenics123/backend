import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('webhook')
  async webHookPayment(@Body() data: any) {
    return this.paymentService.webHookPayment(data);
  }
}
