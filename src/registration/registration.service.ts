import { Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Registration } from './schema/registration.schema';
import { Model } from 'mongoose';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveResponse } from 'src/types/types';

@Injectable()
export class RegistrationService {
  private readonly callBackUrl: string;
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    private paymentService: PaymentService,
    private configService: ConfigService,
  ) {
    this.callBackUrl = this.configService.get<string>('CALLBACK_URL') || '';
  }
  async create(createRegistrationDto: CreateRegistrationDto, files: string[]) {
    //if email exit and payment status is unpaid, update payment ref and return payment url
    //else create new registration and return payment url
    const checkRegistration = await this.registrationModel.findOne({
      email: createRegistrationDto.email,
    });
    if (checkRegistration) {
      const isPaid = ['successful', 'success'].includes(
        checkRegistration.paymentStatus,
      );
      if (!isPaid) {
        checkRegistration.paymentRef = Date.now().toString();
        await checkRegistration.save();
        const paymentData: FlutterwaveResponse =
          await this.paymentService.initiatePayment({
            amount: 2000,
            currency: 'NGN',
            tx_ref: checkRegistration.paymentRef,
            redirect_url: this.callBackUrl,
            payment_options: 'card, mobilemoney, ussd',
            customer: {
              name: createRegistrationDto.firstName,
              email: createRegistrationDto.email,
              phonenumber: createRegistrationDto.phoneNumber,
            },
            meta: {
              type: 'Registration',
            },
          });
        return { flutterwavePaymentUrl: paymentData };
      } else {
        const registrationData = {
          ...createRegistrationDto,
          images: files,
        };

        const registration = new this.registrationModel(registrationData);
        const save = await registration.save();

        if (save) {
          const paymentData: FlutterwaveResponse =
            await this.paymentService.initiatePayment({
              amount: 2000,
              currency: 'NGN',
              tx_ref: save.paymentRef,
              redirect_url: this.callBackUrl,
              payment_options: 'card, mobilemoney, ussd',
              customer: {
                name: createRegistrationDto.firstName,
                email: createRegistrationDto.email,
                phonenumber: createRegistrationDto.phoneNumber,
              },
              meta: {
                type: 'Registration',
              },
            });

          return { flutterwavePaymentUrl: paymentData };
        }
      }
    } else {
      throw new Error('Registration failed');
    }
  }

  findAll() {
    return `This action returns all registration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registration`;
  }

  remove(id: number) {
    return `This action removes a #${id} registration`;
  }
}
