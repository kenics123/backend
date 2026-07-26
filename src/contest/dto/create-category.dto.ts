import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Miss Kenics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 40000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'Ages 18-25' })
  @IsOptional()
  @IsString()
  description?: string;
}
