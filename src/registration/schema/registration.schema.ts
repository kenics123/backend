import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  height: string;

  @Prop({ required: true })
  weight: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ required: true })
  modellingExp: string;

  @Prop({ type: [String], default: [] })
  socials: string[];

  @Prop({
    type: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      number: { type: String, required: true },
    },
    required: true,
  })
  emergencyContact: {
    name: string;
    relationship: string;
    number: string;
  };

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ required: true, default: 'unpaid' })
  paymentStatus: string;

  @Prop({ required: true, default: Date.now().toString() })
  paymentRef: string;
}

export const registrationSchema = SchemaFactory.createForClass(Registration);
