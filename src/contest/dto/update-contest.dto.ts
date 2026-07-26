import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateContestDto {
  @ApiPropertyOptional({ example: 'Kenics Pageant 2026' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Annual beauty pageant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-12-20',
    description: 'Main show / grand finale date',
  })
  @IsOptional()
  @IsDateString()
  showDate?: string;
}
