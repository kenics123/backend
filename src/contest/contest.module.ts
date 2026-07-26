import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';
import { Contest, ContestSchema } from './schema/contest.schema';
import { Category, CategorySchema } from './schema/category.schema';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    AdminModule,
    MongooseModule.forFeature([
      { name: Contest.name, schema: ContestSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService, MongooseModule],
})
export class ContestModule {}
