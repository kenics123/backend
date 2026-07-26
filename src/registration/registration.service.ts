import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationDocument } from './schema/registration.schema';
import { Model } from 'mongoose';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveResponse } from 'src/types/types';
import { ContestantScore } from 'src/vote/schema/vote.schema';
import { ContestService } from 'src/contest/contest.service';

@Injectable()
export class RegistrationService {
  private readonly callBackUrl: string;
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(ContestantScore.name)
    private scoreModel: Model<ContestantScore>,
    private paymentService: PaymentService,
    private configService: ConfigService,
    private contestService: ContestService,
  ) {
    this.callBackUrl = this.configService.get<string>('CALLBACK_URL') || '';
  }

  private async getActiveContestContext(categoryId: string) {
    const contest = await this.contestService.findActive();
    if (!contest) {
      throw new BadRequestException('No active contest available for registration');
    }

    const category = await this.contestService.getCategoryById(categoryId);
    if (category.contest.toString() !== contest._id.toString()) {
      throw new BadRequestException(
        'Selected category does not belong to the active contest',
      );
    }

    if (!category.price || category.price <= 0) {
      throw new BadRequestException('Category price is not configured');
    }

    return { contest, category };
  }

  async create(createRegistrationDto: CreateRegistrationDto, files: string[]) {
    const { contest, category } = await this.getActiveContestContext(
      createRegistrationDto.categoryId,
    );

    const email = createRegistrationDto.email.toLowerCase().trim();
    const amount = category.price;
    const contestTitle = contest.name;

    const checkRegistration = await this.registrationModel.findOne({
      email,
      contest: contest._id,
    });

    if (checkRegistration) {
      const isPaid = ['successful', 'success'].includes(
        checkRegistration.paymentStatus,
      );
      if (isPaid) {
        throw new BadRequestException(
          'You have already registered for this contest',
        );
      }

      checkRegistration.paymentRef = Date.now().toString();
      checkRegistration.categoryId = category._id;
      checkRegistration.category = category.slug;
      await checkRegistration.save();

      const paymentData: FlutterwaveResponse =
        await this.paymentService.initiatePayment({
          amount,
          currency: 'NGN',
          tx_ref: checkRegistration.paymentRef,
          redirect_url: this.callBackUrl,
          payment_options: 'card, mobilemoney, ussd',
          customer: {
            name: createRegistrationDto.firstName,
            email,
            phonenumber: createRegistrationDto.phone,
          },
          meta: {
            type: 'Registration',
            contestId: contest._id.toString(),
            categoryId: category._id.toString(),
          },
          customizations: {
            title: contestTitle,
          },
        });
      return { flutterwavePaymentUrl: paymentData };
    }

    const initialScore = await this.scoreModel.create({});
    const paymentRef = Date.now().toString();

    const registration = new this.registrationModel({
      firstName: createRegistrationDto.firstName,
      lastName: createRegistrationDto.lastName,
      email,
      phone: createRegistrationDto.phone,
      dateOfBirth: createRegistrationDto.dateOfBirth,
      height: createRegistrationDto.height,
      weight: createRegistrationDto.weight,
      bio: createRegistrationDto.bio,
      experience: createRegistrationDto.experience,
      achievements: createRegistrationDto.achievements,
      socialMedia: createRegistrationDto.socialMedia,
      emergencyContact: createRegistrationDto.emergencyContact,
      termsAccepted: createRegistrationDto.termsAccepted,
      contest: contest._id,
      categoryId: category._id,
      category: category.slug,
      photos: files,
      score: initialScore._id,
      paymentRef,
    });
    await registration.save();

    const paymentData: FlutterwaveResponse =
      await this.paymentService.initiatePayment({
        amount,
        currency: 'NGN',
        tx_ref: paymentRef,
        redirect_url: this.callBackUrl,
        payment_options: 'card, mobilemoney, ussd',
        customer: {
          name: createRegistrationDto.firstName,
          email,
          phonenumber: createRegistrationDto.phone,
        },
        meta: {
          type: 'Registration',
          contestId: contest._id.toString(),
          categoryId: category._id.toString(),
        },
        customizations: {
          title: contestTitle,
        },
      });

    return { flutterwavePaymentUrl: paymentData };
  }

  async findAll() {
    const contest = await this.contestService.findActive();
    if (!contest) {
      return [];
    }

    return this.registrationModel
      .find({
        contest: contest._id,
        paymentStatus: {
          $in: ['success', 'successful'],
        },
      })
      .populate({
        path: 'score',
        model: 'ContestantScore',
      })
      .select(
        'score firstName lastName bio photos height weight category categoryId dateOfBirth contest',
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
