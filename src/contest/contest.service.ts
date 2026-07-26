import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contest, ContestDocument } from './schema/contest.schema';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ContestService {
  constructor(
    @InjectModel(Contest.name)
    private readonly contestModel: Model<ContestDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private toSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/kenics/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  async createContest(dto: CreateContestDto) {
    const active = await this.contestModel.findOne({ isActive: true });
    if (active) {
      throw new BadRequestException(
        'An active contest already exists. Deactivate it before creating a new contest.',
      );
    }

    const showDate = new Date(dto.showDate);
    if (Number.isNaN(showDate.getTime())) {
      throw new BadRequestException('Invalid show date');
    }

    const contest = await this.contestModel.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      showDate,
      year: showDate.getFullYear(),
      isActive: false,
      startVoting: false,
    });

    return contest;
  }

  async updateContest(id: string, dto: UpdateContestDto) {
    const contest = await this.contestModel.findById(id);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('Name cannot be empty');
      }
      contest.name = name;
    }

    if (dto.description !== undefined) {
      contest.description = dto.description.trim();
    }

    if (dto.showDate !== undefined) {
      const showDate = new Date(dto.showDate);
      if (Number.isNaN(showDate.getTime())) {
        throw new BadRequestException('Invalid show date');
      }
      contest.showDate = showDate;
      contest.year = showDate.getFullYear();
    }

    await contest.save();
    return contest;
  }

  findAll() {
    return this.contestModel.find().sort({ createdAt: -1 }).exec();
  }

  async findActive() {
    const contest = await this.contestModel.findOne({ isActive: true }).lean();
    if (!contest) {
      return null;
    }

    const categories = await this.categoryModel
      .find({ contest: contest._id })
      .sort({ price: 1 })
      .lean();

    return { ...contest, categories };
  }

  async findOne(id: string) {
    const contest = await this.contestModel.findById(id).lean();
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const categories = await this.categoryModel
      .find({ contest: id })
      .sort({ price: 1 })
      .lean();

    return { ...contest, categories };
  }

  async activate(id: string) {
    const contest = await this.contestModel.findById(id);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    if (contest.isActive) {
      return contest;
    }

    const active = await this.contestModel.findOne({ isActive: true });
    if (active) {
      throw new BadRequestException(
        'Another contest is active. Deactivate it before activating this one.',
      );
    }

    const categoryCount = await this.categoryModel.countDocuments({
      contest: id,
    });
    if (categoryCount === 0) {
      throw new BadRequestException(
        'Add at least one category before activating this contest.',
      );
    }

    contest.isActive = true;
    await contest.save();
    return contest;
  }

  async deactivate(id: string) {
    const contest = await this.contestModel.findById(id);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    contest.isActive = false;
    await contest.save();
    return contest;
  }

  async setStartVoting(id: string, startVoting: boolean) {
    const contest = await this.contestModel.findById(id);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    contest.startVoting = startVoting;
    await contest.save();
    return contest;
  }

  async addCategory(contestId: string, dto: CreateCategoryDto) {
    const contest = await this.contestModel.findById(contestId);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const slug = this.toSlug(dto.name);
    if (!slug) {
      throw new BadRequestException('Invalid category name');
    }

    const existing = await this.categoryModel.findOne({
      contest: contestId,
      slug,
    });
    if (existing) {
      throw new BadRequestException(
        'A category with this name already exists for this contest',
      );
    }

    return this.categoryModel.create({
      contest: contestId,
      name: dto.name.trim(),
      slug,
      price: dto.price,
      description: dto.description?.trim() || '',
    });
  }

  async getCategories(contestId: string) {
    const contest = await this.contestModel.findById(contestId);
    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    return this.categoryModel.find({ contest: contestId }).sort({ price: 1 });
  }

  async getCategoryById(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
