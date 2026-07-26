import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVoteDto {
  @ApiProperty({ description: 'Registration (model) ID to vote for' })
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @ApiProperty({ example: 10, description: 'Number of votes to purchase' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  votes: number;

  @ApiProperty({ example: 'voter@email.com' })
  @IsEmail()
  voterEmail: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  voterName?: string;

  @ApiPropertyOptional({ example: '08012345678' })
  @IsOptional()
  @IsString()
  voterPhone?: string;
}
