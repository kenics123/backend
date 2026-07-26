import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { AdminAuthGuard } from 'src/admin/guards/admin-auth.guard';

@ApiTags('Registration Admin')
@Controller('registration/admin')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class AdminRegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get('list')
  @ApiOperation({ summary: 'List registrations for admin (filter by contest)' })
  @ApiQuery({ name: 'contestId', required: false, type: String })
  findAllForAdmin(@Query('contestId') contestId?: string) {
    return this.registrationService.findAllForAdmin(contestId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration details by id (admin)' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  findOneForAdmin(@Param('id') id: string) {
    return this.registrationService.findOneForAdmin(id);
  }
}
