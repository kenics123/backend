import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Miss Kenics' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 40000, description: 'Registration fee' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 100, description: 'Price per vote' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  votingPrice?: number;

  @ApiPropertyOptional({ example: 'Ages 18-25' })
  @IsOptional()
  @IsString()
  description?: string;
}
