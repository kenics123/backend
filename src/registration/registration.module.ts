import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { FileService } from 'src/file/file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, registrationSchema } from './schema/registration.schema';
import { ConfigModule } from '@nestjs/config';
import {
  ContestantScore,
  ContestantScoreSchema,
} from 'src/vote/schema/vote.schema';
import { ContestModule } from 'src/contest/contest.module';
import { AdminModule } from 'src/admin/admin.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    ContestModule,
    AdminModule,
    PaymentModule,
    MongooseModule.forFeature([
      { name: Registration.name, schema: registrationSchema },
      { name: ContestantScore.name, schema: ContestantScoreSchema },
    ]),
    ConfigModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, FileService],
})
export class RegistrationModule {}
