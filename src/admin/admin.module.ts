import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthController } from './admin-auth.controller';
import { AdminRegisterController } from './admin-register.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schema/admin.schema';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { Contest, ContestSchema } from 'src/contest/schema/contest.schema';
import {
  Registration,
  registrationSchema,
} from 'src/registration/schema/registration.schema';
import { Contact, ContactSchema } from 'src/contact/schema/contact.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: Registration.name, schema: registrationSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'change-me-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '1d') as `${number}d`,
        },
      }),
    }),
  ],
  controllers: [AdminAuthController, AdminRegisterController],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService, AdminAuthGuard, JwtModule],
})
export class AdminModule {}
