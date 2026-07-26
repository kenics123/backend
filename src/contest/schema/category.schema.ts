import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'Contest', required: true, index: true })
  contest: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, default: 0 })
  votingPrice: number;

  @Prop({ default: '', trim: true })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ contest: 1, slug: 1 }, { unique: true });
