import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  registrationSchema,
} from 'src/registration/schema/registration.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Registration.name, schema: registrationSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
