import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import {
  VotePayment,
  VotePaymentSchema,
} from './schema/vote-payment.schema';
import {
  ContestantScore,
  ContestantScoreSchema,
} from './schema/vote.schema';
import {
  Registration,
  registrationSchema,
} from 'src/registration/schema/registration.schema';
import { ContestModule } from 'src/contest/contest.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    ConfigModule,
    ContestModule,
    PaymentModule,
    MongooseModule.forFeature([
      { name: VotePayment.name, schema: VotePaymentSchema },
      { name: ContestantScore.name, schema: ContestantScoreSchema },
      { name: Registration.name, schema: registrationSchema },
    ]),
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService, MongooseModule],
})
export class VoteModule {}
