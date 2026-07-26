import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@ApiTags('Admin Auth')
@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login (used by frontend)' })
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  me(@Req() req: { admin: { sub: string } }) {
    return this.adminService.findById(req.admin.sub);
  }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard stats (admin)' })
  stats() {
    return this.adminService.getDashboardStats();
  }
}
