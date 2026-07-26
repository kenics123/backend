import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateContestDto {
  @ApiProperty({ example: 'Kenics Pageant 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Annual beauty pageant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  year: number;
}
