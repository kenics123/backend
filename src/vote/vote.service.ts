import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { CreateVoteDto } from './dto/create-vote.dto';
import {
  VotePayment,
  VotePaymentDocument,
} from './schema/vote-payment.schema';
import {
  Registration,
  RegistrationDocument,
} from 'src/registration/schema/registration.schema';
import {
  ContestantScore,
  ContestantScoreDocument,
} from './schema/vote.schema';
import { ContestService } from 'src/contest/contest.service';
import { PaymentService } from 'src/payment/payment.service';
import { FlutterwaveResponse } from 'src/types/types';

@Injectable()
export class VoteService {
  private readonly callBackUrl: string;

  constructor(
    @InjectModel(VotePayment.name)
    private readonly votePaymentModel: Model<VotePaymentDocument>,
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<RegistrationDocument>,
    @InjectModel(ContestantScore.name)
    private readonly scoreModel: Model<ContestantScoreDocument>,
    private readonly contestService: ContestService,
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {
    this.callBackUrl = this.configService.get<string>('CALLBACK_URL') || '';
  }

  private isPaidStatus(status: unknown) {
    return ['successful', 'success', 'succeeded'].includes(
      String(status ?? '')
        .trim()
        .toLowerCase(),
    );
  }

  async create(dto: CreateVoteDto) {
    const contest = await this.contestService.findActive();
    if (!contest) {
      throw new BadRequestException('No active contest available');
    }

    if (!contest.startVoting) {
      throw new BadRequestException('Voting has not started yet');
    }

    const registration = await this.registrationModel.findById(
      dto.registrationId,
    );
    if (!registration) {
      throw new NotFoundException('Contestant not found');
    }

    if (String(registration.contest) !== String(contest._id)) {
      throw new BadRequestException(
        'Contestant is not part of the active contest',
      );
    }

    if (!this.isPaidStatus(registration.paymentStatus)) {
      throw new BadRequestException('Contestant is not eligible for voting');
    }

    const category = await this.contestService.getCategoryById(
      String(registration.categoryId),
    );
    if (String(category.contest) !== String(contest._id)) {
      throw new BadRequestException('Invalid contestant category');
    }

    const votingPrice = Number(category.votingPrice);
    if (!Number.isFinite(votingPrice) || votingPrice < 0) {
      throw new BadRequestException('Voting price is not configured');
    }

    const votes = Number(dto.votes);
    const amount = votes * votingPrice;
    if (amount <= 0) {
      throw new BadRequestException('Vote amount must be greater than zero');
    }

    const paymentRef = `vote_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const voterEmail = dto.voterEmail.toLowerCase().trim();
    const voterName = dto.voterName?.trim() || 'Voter';
    const voterPhone = dto.voterPhone?.trim() || '';

    await this.votePaymentModel.create({
      contest: contest._id,
      category: category._id,
      registration: registration._id,
      votes,
      votingPrice,
      amount,
      paymentRef,
      paymentStatus: 'unpaid',
      applied: false,
      voterEmail,
      voterName,
      voterPhone,
    });

    const paymentData: FlutterwaveResponse =
      await this.paymentService.initiatePayment({
        amount,
        currency: 'NGN',
        tx_ref: paymentRef,
        redirect_url: this.callBackUrl,
        payment_options: 'card, mobilemoney, ussd',
        customer: {
          name: voterName,
          email: voterEmail,
          phonenumber: voterPhone || undefined,
        },
        meta: {
          type: 'Vote',
          contestId: String(contest._id),
          categoryId: String(category._id),
          registrationId: String(registration._id),
          votes: String(votes),
        },
        customizations: {
          title: `${contest.name} — Vote for ${registration.firstName}`,
        },
      });

    return {
      flutterwavePaymentUrl: paymentData,
      amount,
      votes,
      votingPrice,
      paymentRef,
    };
  }

  async applyPaidVote(vote: VotePaymentDocument) {
    if (vote.applied || !this.isPaidStatus(vote.paymentStatus)) {
      return vote;
    }

    const registration = await this.registrationModel.findById(
      vote.registration,
    );
    if (!registration?.score) {
      throw new NotFoundException('Contestant score not found');
    }

    await this.scoreModel.findByIdAndUpdate(registration.score, {
      $inc: { voteCount: vote.votes },
      $set: { lastVotedAt: new Date() },
    });

    vote.applied = true;
    await vote.save();
    return vote;
  }

  async findByPaymentRef(paymentRef: string) {
    return this.votePaymentModel.findOne({ paymentRef });
  }

  async getWinners() {
    // Prefer active contest; if none, show the most recently created one.
    const contest =
      (await this.contestService.findActive()) ||
      (await this.contestService.findLatest());

    if (!contest) {
      return {
        contest: null,
        votingOpen: false,
        fromLatestInactive: false,
        winners: [],
      };
    }

    const isActive = Boolean(contest.isActive);
    const votingOpen = isActive && Boolean(contest.startVoting);
    const showAsWinners = !votingOpen;

    const registrations = await this.registrationModel
      .find({
        contest: contest._id,
        paymentStatus: { $in: ['success', 'successful'] },
      })
      .populate({
        path: 'score',
        model: 'ContestantScore',
      })
      .select(
        'firstName lastName photos category categoryId score bio dateOfBirth',
      )
      .lean()
      .exec();

    const byCategory = new Map<
      string,
      {
        categoryId: string;
        category: string;
        contestant: (typeof registrations)[number] | null;
        voteCount: number;
      }
    >();

    for (const category of contest.categories || []) {
      byCategory.set(String(category._id), {
        categoryId: String(category._id),
        category: category.name,
        contestant: null,
        voteCount: 0,
      });
    }

    for (const registration of registrations) {
      const categoryId = String(registration.categoryId);
      const voteCount = Number(
        (registration.score as { voteCount?: number } | null)?.voteCount || 0,
      );
      const categoryMeta = (contest.categories || []).find(
        (c: { _id: unknown }) => String(c._id) === categoryId,
      ) as { name?: string } | undefined;
      const current = byCategory.get(categoryId) || {
        categoryId,
        category: categoryMeta?.name || registration.category,
        contestant: null,
        voteCount: 0,
      };

      if (!current.contestant || voteCount > current.voteCount) {
        current.contestant = registration;
        current.voteCount = voteCount;
        current.category =
          categoryMeta?.name || registration.category || current.category;
      }
      byCategory.set(categoryId, current);
    }

    return {
      contest: {
        _id: contest._id,
        name: contest.name,
        startVoting: contest.startVoting,
        showDate: contest.showDate,
        isActive,
      },
      votingOpen,
      fromLatestInactive: !isActive,
      winners: [...byCategory.values()].map((entry) => ({
        categoryId: entry.categoryId,
        category: entry.category,
        voteCount: entry.voteCount,
        contestant: entry.contestant,
        isWinner: showAsWinners && entry.voteCount > 0,
        isLeading: votingOpen && entry.voteCount > 0,
      })),
    };
  }
}
