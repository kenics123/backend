import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { RegistrationModule } from './registration/registration.module';
import { MongooseModule } from '@nestjs/mongoose';
import dbConfig from './config/db.config';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    FileModule,
    RegistrationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [dbConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: dbConfig,
    }),
    PaymentModule,
  ],
})
export class AppModule {}
