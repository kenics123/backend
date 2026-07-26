import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GalleryDocument = HydratedDocument<GalleryPhoto>;

@Schema({ timestamps: true })
export class GalleryPhoto {
  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  publicId: string;

  @Prop({ default: '', trim: true })
  caption: string;
}

export const GalleryPhotoSchema = SchemaFactory.createForClass(GalleryPhoto);
