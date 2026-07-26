import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';

function toNestedDto<T>(cls: new () => T, value: unknown): T | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return undefined;
  }

  return plainToInstance(cls, parsed);
}

export class SocialMediaDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  facebook?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  instagram?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  tiktok?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  twitter?: string;
}

export class EmergencyContactDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  relationship: string;

  @IsString()
  @ApiProperty()
  phone: string;
}

export class CreateRegistrationDto {
  @IsString()
  @ApiProperty({ description: 'Category ID from active contest' })
  categoryId: string;

  @IsString()
  @ApiProperty({ description: 'First name' })
  firstName: string;

  @IsString()
  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  @ApiProperty({ description: 'User phone number' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'User height' })
  height: string;

  @IsString()
  @ApiProperty({ description: 'User weight' })
  weight: string;

  @IsString()
  @ApiProperty({ description: 'User bio' })
  bio: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User achievements' })
  achievements?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @ApiProperty({ description: 'User terms accepted' })
  termsAccepted: boolean;

  @IsString()
  @ApiProperty({ description: 'User modelling experience' })
  experience: string;

  @IsDateString()
  @ApiProperty({ description: 'User Date of birth' })
  dateOfBirth: string;

  @IsOptional()
  @Transform(({ value }) => toNestedDto(SocialMediaDto, value))
  @ValidateNested()
  @Type(() => SocialMediaDto)
  @ApiPropertyOptional({
    description: 'Social media links (optional)',
    type: () => SocialMediaDto,
  })
  socialMedia?: SocialMediaDto;

  @Transform(({ value }) => toNestedDto(EmergencyContactDto, value))
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @ApiProperty({
    description: 'User emergency contact',
    type: () => EmergencyContactDto,
  })
  emergencyContact: EmergencyContactDto;
}
