import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  registrationSchema,
} from 'src/registration/schema/registration.schema';
import {
  VotePayment,
  VotePaymentSchema,
} from 'src/vote/schema/vote-payment.schema';
import {
  ContestantScore,
  ContestantScoreSchema,
} from 'src/vote/schema/vote.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Registration.name, schema: registrationSchema },
      { name: VotePayment.name, schema: VotePaymentSchema },
      { name: ContestantScore.name, schema: ContestantScoreSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
