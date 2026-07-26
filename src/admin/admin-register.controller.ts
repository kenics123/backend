import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Admin Registration')
@Controller('admin')
export class AdminRegisterController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  @ApiOperation({
    summary:
      'Create the first admin (Swagger/API only — not exposed in frontend)',
    description:
      'Use this endpoint from Swagger to bootstrap the first admin account. Disabled after one admin exists.',
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }
}
