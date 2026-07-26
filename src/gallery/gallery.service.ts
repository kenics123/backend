import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GalleryPhoto,
  GalleryDocument,
} from './schema/gallery.schema';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryPhoto.name)
    private readonly galleryModel: Model<GalleryDocument>,
  ) {}

  createMany(
    photos: { url: string; publicId?: string; caption?: string }[],
  ) {
    return this.galleryModel.insertMany(
      photos.map((photo) => ({
        url: photo.url,
        publicId: photo.publicId || '',
        caption: photo.caption?.trim() || '',
      })),
    );
  }

  findAll() {
    return this.galleryModel.find().sort({ createdAt: -1 }).exec();
  }

  async remove(id: string) {
    const photo = await this.galleryModel.findByIdAndDelete(id);
    if (!photo) {
      throw new NotFoundException('Gallery photo not found');
    }
    return { deleted: true, id };
  }
}
