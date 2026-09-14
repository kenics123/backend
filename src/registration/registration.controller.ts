import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { CloudinaryUploadResponse } from 'src/types/types';
import {
  assertAllowedImageFiles,
  imageFileFilter,
} from 'src/common/image-upload';

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
        categoryId: { type: 'string' },
        achievements: { type: 'string' },
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
            phone: { type: 'string' },
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
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Body()
    createRegistrationDto: CreateRegistrationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    assertAllowedImageFiles(files || []);
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
  @ApiParam({
    name: 'id',
    description: 'Registration ID',
    required: true,
    type: 'string',
  })
  findOne(@Param('id') id: string) {
    return this.registrationService.findOne(id);
  }
}
