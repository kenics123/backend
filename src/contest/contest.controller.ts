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
import { UpdateContestDto } from './dto/update-contest.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contest name, description, and show date (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateContestDto) {
    return this.contestService.updateContest(id, dto);
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

  @Patch(':id/start-voting')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable voting for contest (admin)' })
  startVoting(@Param('id') id: string) {
    return this.contestService.setStartVoting(id, true);
  }

  @Patch(':id/stop-voting')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable voting for contest (admin)' })
  stopVoting(@Param('id') id: string) {
    return this.contestService.setStartVoting(id, false);
  }

  @Post(':id/categories')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add category with registration + voting price (admin)',
  })
  addCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.contestService.addCategory(id, dto);
  }

  @Patch(':id/categories/:categoryId')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin)' })
  updateCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.contestService.updateCategory(id, categoryId, dto);
  }

  @Get(':id/categories')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List categories for contest (admin)' })
  getCategories(@Param('id') id: string) {
    return this.contestService.getCategories(id);
  }
}
