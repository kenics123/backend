import {
  IsBoolean,
  IsDateString,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SocialMedia {
  @IsString()
  @ApiProperty()
  facebook: string;

  @IsString()
  @ApiProperty()
  instagram: string;

  @IsString()
  @ApiProperty()
  tiktok: string;

  @IsString()
  @ApiProperty()
  twitter: string;
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
  number: string;
}

export class CreateRegistrationDto {
  @IsString()
  @ApiProperty({ description: 'User email' })
  firstName: string;

  @IsString()
  @ApiProperty({ description: 'User email' })
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  @ApiProperty({ description: 'User phone number' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'User category' })
  category: string;

  @IsString()
  @ApiProperty({ description: 'User height' })
  height: string;

  @IsString()
  @ApiProperty({ description: 'User weight' })
  weight: string;

  @IsString()
  @ApiProperty({ description: 'User bio' })
  bio: string;

  @IsString()
  @ApiProperty({ description: 'User achievements' })
  achievements: string;

  @IsBoolean()
  @ApiProperty({ description: 'User terms accepted' })
  termsAccepted: boolean;

  @IsString()
  @ApiProperty({ description: 'User modelling experience' })
  experience: string;

  @IsDateString()
  @ApiProperty({ description: 'User Date of birth' })
  dateOfBirth: string;

  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @ValidateNested()
  @Type(() => SocialMedia)
  @ApiProperty({
    description: 'Social media links',
    type: () => SocialMedia,
  })
  socialMedia: SocialMedia;

  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }

    return value;
  })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @ApiProperty({
    description: 'User emergency contact',
    type: () => EmergencyContactDto,
  })
  emergencyContact: EmergencyContactDto;
}
