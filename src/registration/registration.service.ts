import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Registration } from './schema/registration.schema';
import { Model, Types } from 'mongoose';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveResponse } from 'src/types/types';
import { ContestantScore } from 'src/vote/schema/vote.schema';

@Injectable()
export class RegistrationService {
  private readonly callBackUrl: string;
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    @InjectModel(ContestantScore.name)
    private scoreModel: Model<ContestantScore>,
    private paymentService: PaymentService,
    private configService: ConfigService,
  ) {
    this.callBackUrl = this.configService.get<string>('CALLBACK_URL') || '';
  }

  getAmount(category: string) {
    const amountMap: Record<string, number> = {
      baby: 10000,
      teen: 20000,
      miss: 40000,
      mrs: 60000,
    };

    return amountMap[category] ?? 0; // default to 0 if not found
  }
  async create(createRegistrationDto: CreateRegistrationDto, files: string[]) {
    //if email exit and payment status is unpaid, update payment ref and return payment url
    //else create new registration and return payment url
    const amount = this.getAmount(createRegistrationDto?.category);
    const checkRegistration = await this.registrationModel.findOne({
      email: createRegistrationDto.email,
    });
    if (checkRegistration) {
      const isPaid = ['successful', 'success'].includes(
        checkRegistration.paymentStatus,
      );
      if (!isPaid) {
        checkRegistration.paymentRef = Date.now().toString();
        const paymentData: FlutterwaveResponse =
          await this.paymentService.initiatePayment({
            amount: amount,
            currency: 'NGN',
            tx_ref: checkRegistration.paymentRef,
            redirect_url: this.callBackUrl,
            payment_options: 'card, mobilemoney, ussd',
            customer: {
              name: createRegistrationDto.firstName,
              email: createRegistrationDto.email,
              phonenumber: createRegistrationDto.phone,
            },
            meta: {
              type: 'Registration',
            },
            customizations: {
              title: 'Kenics Contest',
            },
          });
        return { flutterwavePaymentUrl: paymentData };
      } else if (isPaid) {
        throw new BadRequestException('You have already registered');
      }
    } else {
      const initialScore = await this.scoreModel.create({});

      const registrationData = {
        ...createRegistrationDto,
        photos: files,
        score: initialScore._id,
      };

      const registration = new this.registrationModel(registrationData);
      const save = await registration.save();

      if (save) {
        const paymentData: FlutterwaveResponse =
          await this.paymentService.initiatePayment({
            amount: amount,
            currency: 'NGN',
            tx_ref: save.paymentRef,
            redirect_url: this.callBackUrl,
            payment_options: 'card, mobilemoney, ussd',
            customer: {
              name: registrationData.firstName,
              email: registrationData.email,
              phonenumber: registrationData.phone,
            },
            meta: {
              type: 'Registration',
            },
            customizations: {
              title: 'Kenics Contest',
            },
          });

        return { flutterwavePaymentUrl: paymentData };
      } else {
        throw new BadRequestException('Registration failed');
      }
    }
  }

  findAll() {
    return this.registrationModel
      .find({
        paymentStatus: {
          $in: ['success', 'successful'],
        },
      })
      .populate({
        path: 'score',
        model: 'ContestantScore',
      })
      .select(
        'score firstName lastName bio photos height weight category dateOfBirth',
      )
      .exec();
  }

  findOne(id: string) {
    return this.registrationModel.findById(id).populate({
      path: 'score',
      model: 'ContestantScore',
    });
  }

  remove(id: string) {
    return `This action removes a #${id} registration`;
  }
}
