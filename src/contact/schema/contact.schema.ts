import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  whatsapp: string;

  @Prop({ default: '', trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
