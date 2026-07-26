import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContestDocument = HydratedDocument<Contest>;

@Schema({ timestamps: true })
export class Contest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ required: true })
  year: number;

  /** Main show / grand finale date */
  @Prop({ required: true })
  showDate: Date;

  @Prop({ default: false, index: true })
  isActive: boolean;
}

export const ContestSchema = SchemaFactory.createForClass(Contest);
