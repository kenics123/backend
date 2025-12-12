import { Allow, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class EmergencyContactDto {
  @Allow()
  @IsString()
  @ApiProperty()
  name: string;

  @Allow()
  @IsString()
  @ApiProperty()
  relationship: string;

  @Allow()
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
  phoneNumber: string;

  @IsString()
  @ApiProperty({ description: 'User category' })
  category: string;

  @IsString()
  @ApiProperty({ description: 'User address' })
  address: string;

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
  @ApiProperty({ description: 'User modelling experience' })
  modellingExp: string;

  @IsString()
  @ApiProperty({ description: 'User socials' })
  socials: string;

  @Transform(({ value }) => {
    // If it's already an object, return it
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // Return as-is, let validation catch the error
      }
    }
    return value;
  })
  @IsObject()
  //   @ValidateNested()
  @Type(() => EmergencyContactDto)
  @ApiProperty({
    description: 'User emergency contact',
    type: () => EmergencyContactDto,
  })
  emergencyContact: EmergencyContactDto;
}
