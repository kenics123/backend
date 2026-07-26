import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  private isPaidStatus(status: unknown): boolean {
    return ['successful', 'success', 'succeeded'].includes(
      String(status ?? '')
        .trim()
        .toLowerCase(),
    );
  }

  private async createPaymentLink(input: {
    amount: number;
    paymentRef: string;
    contestTitle: string;
    contestId: string;
    categoryId: string;
    firstName: string;
    email: string;
    phone: string;
  }) {
    return this.paymentService.initiatePayment({
      amount: input.amount,
      currency: 'NGN',
      tx_ref: input.paymentRef,
      redirect_url: this.callBackUrl,
      payment_options: 'card, mobilemoney, ussd',
      customer: {
        name: input.firstName,
        email: input.email,
        phonenumber: input.phone,
      },
      meta: {
        type: 'Registration',
        contestId: input.contestId,
        categoryId: input.categoryId,
      },
      customizations: {
        title: input.contestTitle,
      },
    });
  }

  async create(createRegistrationDto: CreateRegistrationDto, files: string[]) {
    const { contest, category } = await this.getActiveContestContext(
      createRegistrationDto.categoryId,
    );

    const email = createRegistrationDto.email.toLowerCase().trim();
    const amount = category.price;
    const contestTitle = contest.name;
    const contestId = contest._id.toString();
    const categoryId = category._id.toString();

    // Same email can register for different contests.
    // For the same contest: paid → reject; unpaid → return a new payment URL.
    const existingForContest = await this.registrationModel.findOne({
      email,
      contest: contest._id,
    });

    if (existingForContest) {
      if (this.isPaidStatus(existingForContest.paymentStatus)) {
        throw new BadRequestException(
          'Already registered for this contest',
        );
      }

      const paymentRef = Date.now().toString();
      existingForContest.paymentRef = paymentRef;
      existingForContest.categoryId = category._id;
      existingForContest.category = category.slug;
      existingForContest.firstName = createRegistrationDto.firstName;
      existingForContest.lastName = createRegistrationDto.lastName;
      existingForContest.phone = createRegistrationDto.phone;
      existingForContest.dateOfBirth = createRegistrationDto.dateOfBirth;
      existingForContest.height = createRegistrationDto.height;
      existingForContest.weight = createRegistrationDto.weight;
      existingForContest.bio = createRegistrationDto.bio;
      existingForContest.experience = createRegistrationDto.experience;
      existingForContest.achievements = createRegistrationDto.achievements;
      existingForContest.socialMedia = {
        facebook: createRegistrationDto.socialMedia?.facebook ?? '',
        instagram: createRegistrationDto.socialMedia?.instagram ?? '',
        twitter: createRegistrationDto.socialMedia?.twitter ?? '',
        tiktok: createRegistrationDto.socialMedia?.tiktok ?? '',
      };
      existingForContest.emergencyContact =
        createRegistrationDto.emergencyContact;
      existingForContest.termsAccepted = createRegistrationDto.termsAccepted;
      if (files?.length) {
        existingForContest.photos = files;
      }
      await existingForContest.save();

      const paymentData: FlutterwaveResponse = await this.createPaymentLink({
        amount,
        paymentRef,
        contestTitle,
        contestId,
        categoryId,
        firstName: createRegistrationDto.firstName,
        email,
        phone: createRegistrationDto.phone,
      });

      return {
        flutterwavePaymentUrl: paymentData,
        pendingPayment: true,
        message: 'Registration found but unpaid. Complete payment to finish.',
      };
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
      socialMedia: {
        facebook: createRegistrationDto.socialMedia?.facebook ?? '',
        instagram: createRegistrationDto.socialMedia?.instagram ?? '',
        twitter: createRegistrationDto.socialMedia?.twitter ?? '',
        tiktok: createRegistrationDto.socialMedia?.tiktok ?? '',
      },
      emergencyContact: createRegistrationDto.emergencyContact,
      termsAccepted: createRegistrationDto.termsAccepted,
      contest: contest._id,
      categoryId: category._id,
      category: category.slug,
      photos: files,
      score: initialScore._id,
      paymentRef,
      paymentStatus: 'unpaid',
    });
    await registration.save();

    const paymentData: FlutterwaveResponse = await this.createPaymentLink({
      amount,
      paymentRef,
      contestTitle,
      contestId,
      categoryId,
      firstName: createRegistrationDto.firstName,
      email,
      phone: createRegistrationDto.phone,
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

  async findAllForAdmin(contestId?: string) {
    const filter: Record<string, unknown> = {};
    if (contestId) {
      filter.contest = contestId;
    }

    return this.registrationModel
      .find(filter)
      .populate({
        path: 'score',
        model: 'ContestantScore',
      })
      .populate({
        path: 'contest',
        model: 'Contest',
        select: 'name year showDate isActive',
      })
      .sort({ createdAt: -1 })
      .select(
        'firstName lastName email phone category categoryId paymentStatus paymentRef photos dateOfBirth height weight bio contest score createdAt',
      )
      .exec();
  }

  findOne(id: string) {
    return this.registrationModel.findById(id).populate({
      path: 'score',
      model: 'ContestantScore',
    });
  }

  async findOneForAdmin(id: string) {
    const registration = await this.registrationModel
      .findById(id)
      .populate({
        path: 'score',
        model: 'ContestantScore',
      })
      .populate({
        path: 'contest',
        model: 'Contest',
        select: 'name year showDate isActive description',
      })
      .populate({
        path: 'categoryId',
        model: 'Category',
        select: 'name slug price description',
      })
      .exec();

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  remove(id: string) {
    return `This action removes a #${id} registration`;
  }
}
