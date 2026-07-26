import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

function emptyToUndefined({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class CreateContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'jane@example.com',
    description: 'Required if WhatsApp number is not provided',
  })
  @Transform(emptyToUndefined)
  @ValidateIf((o: CreateContactDto) => !o.whatsapp)
  @IsEmail()
  @IsNotEmpty({ message: 'Provide either email or WhatsApp number' })
  email?: string;

  @ApiPropertyOptional({
    example: '+2348026190053',
    description: 'Required if email is not provided',
  })
  @Transform(emptyToUndefined)
  @ValidateIf((o: CreateContactDto) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Provide either email or WhatsApp number' })
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'Sponsorship inquiry' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @ApiProperty({ example: 'I would like to know more about registration.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
