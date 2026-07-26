import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContestService } from './contest.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AdminAuthGuard } from 'src/admin/guards/admin-auth.guard';

@ApiTags('Contest')
@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active contest with categories' })
  findActive() {
    return this.contestService.findActive();
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all contests (admin)' })
  findAll() {
    return this.contestService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contest with categories (admin)' })
  findOne(@Param('id') id: string) {
    return this.contestService.findOne(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contest (admin) — requires no active contest' })
  create(@Body() dto: CreateContestDto) {
    return this.contestService.createContest(dto);
  }

  @Patch(':id/activate')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate contest (admin)' })
  activate(@Param('id') id: string) {
    return this.contestService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate contest (admin)' })
  deactivate(@Param('id') id: string) {
    return this.contestService.deactivate(id);
  }

  @Post(':id/categories')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add category with price to contest (admin)' })
  addCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.contestService.addCategory(id, dto);
  }

  @Get(':id/categories')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List categories for contest (admin)' })
  getCategories(@Param('id') id: string) {
    return this.contestService.getCategories(id);
  }
}
