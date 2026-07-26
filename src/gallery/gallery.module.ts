import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import {
  GalleryPhoto,
  GalleryPhotoSchema,
} from './schema/gallery.schema';
import { FileModule } from 'src/file/file.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    AdminModule,
    FileModule,
    MongooseModule.forFeature([
      { name: GalleryPhoto.name, schema: GalleryPhotoSchema },
    ]),
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
