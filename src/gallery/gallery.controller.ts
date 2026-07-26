import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { FileService } from 'src/file/file.service';
import { AdminAuthGuard } from 'src/admin/guards/admin-auth.guard';
import { CloudinaryUploadResponse } from 'src/types/types';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List gallery photos (public)' })
  findAll() {
    return this.galleryService.findAll();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload gallery photos (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caption: { type: 'string' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('caption') caption?: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Please upload at least one photo');
    }

    const uploaded = await this.fileService.uploadMultipleToCloudinary(files);
    const photos = uploaded.map((file: CloudinaryUploadResponse) => ({
      url: file.secure_url,
      publicId: file.public_id,
      caption: caption || '',
    }));

    return this.galleryService.createMany(photos);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery photo (admin)' })
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
