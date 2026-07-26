import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './schema/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const adminCount = await this.adminModel.countDocuments();
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Admin already exists. Contact an existing admin.',
      );
    }

    const existing = await this.adminModel.findOne({
      email: createAdminDto.email.toLowerCase().trim(),
    });
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 12);
    const admin = await this.adminModel.create({
      name: createAdminDto.name.trim(),
      email: createAdminDto.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };
  }

  async login(loginAdminDto: LoginAdminDto) {
    const email = loginAdminDto.email.toLowerCase().trim();
    const admin = await this.adminModel
      .findOne({ email })
      .select('+password');

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(
      loginAdminDto.password,
      admin.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: 'admin',
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  async findById(id: string) {
    const admin = await this.adminModel.findById(id);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };
  }
}
