import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { FileService } from 'src/file/file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, registrationSchema } from './schema/registration.schema';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigModule } from '@nestjs/config';
import {
  ContestantScore,
  ContestantScoreSchema,
} from 'src/vote/schema/vote.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: registrationSchema },
      { name: ContestantScore.name, schema: ContestantScoreSchema },
    ]),
    ConfigModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, FileService, PaymentService],
})
export class RegistrationModule {}
