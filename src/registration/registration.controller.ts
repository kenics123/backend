import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CloudinaryUploadResponse } from 'src/types/types';

@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date' },
        category: { type: 'string' },
        height: { type: 'string' },
        weight: { type: 'string' },
        termsAccepted: { type: 'boolean' },
        bio: { type: 'string' },
        experience: { type: 'string' },
        socialMedia: {
          type: 'object',
          properties: {
            facebook: { type: 'string' },
            twitter: { type: 'string' },
            instagram: { type: 'string' },
            tiktok: { type: 'string' },
          },
        },
        emergencyContact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            relationship: { type: 'string' },
            number: { type: 'string' },
          },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 6, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body()
    createRegistrationDto: CreateRegistrationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedImages =
      await this.fileService.uploadMultipleToCloudinary(files);
    const imagesUrl = uploadedImages.map(
      (images: CloudinaryUploadResponse) => images.secure_url,
    );

    return this.registrationService.create(createRegistrationDto, imagesUrl);
  }

  @Get()
  findAll() {
    return this.registrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationService.remove(+id);
  }
}
