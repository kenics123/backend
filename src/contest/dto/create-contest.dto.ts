import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContestDto {
  @ApiProperty({ example: 'Kenics Pageant 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Annual beauty pageant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-12-20',
    description: 'Main show / grand finale date',
  })
  @IsDateString()
  showDate: string;
}
