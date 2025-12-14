import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { ContestantScore } from 'src/vote/schema/vote.schema';

export type RegistrationDocument = HydratedDocument<Registration>;

class SocialMedia {
  @Prop({ default: '' })
  facebook: string;

  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  twitter: string;

  @Prop({ default: '' })
  tiktok: string;
}

class EmergencyContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  relationship: string;

  @Prop({ required: true })
  phone: string;
}

@Schema({ timestamps: true })
export class Registration {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  height: string;

  @Prop({ required: true })
  weight: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ required: true })
  experience: string;

  @Prop()
  achievements?: string;

  @Prop({ type: SocialMedia, _id: false })
  socialMedia: SocialMedia;

  @Prop({ type: EmergencyContact, _id: false })
  emergencyContact: EmergencyContact;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ required: true })
  termsAccepted: boolean;

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ required: true, default: 'unpaid' })
  paymentStatus: string;

  @Prop({ required: true, default: Date.now().toString() })
  paymentRef: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'ContestantScore',
    unique: true,
    required: true,
  })
  score: ContestantScore;
}

export const registrationSchema = SchemaFactory.createForClass(Registration);
