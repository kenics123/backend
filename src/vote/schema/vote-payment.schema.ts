import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VotePaymentDocument = HydratedDocument<VotePayment>;

@Schema({ timestamps: true })
export class VotePayment {
  @Prop({ type: Types.ObjectId, ref: 'Contest', required: true, index: true })
  contest: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Registration',
    required: true,
    index: true,
  })
  registration: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  votes: number;

  @Prop({ required: true, min: 0 })
  votingPrice: number;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, unique: true, index: true })
  paymentRef: string;

  @Prop({ required: true, default: 'unpaid' })
  paymentStatus: string;

  @Prop({ default: false })
  applied: boolean;

  @Prop({ required: true, lowercase: true, trim: true })
  voterEmail: string;

  @Prop({ default: '', trim: true })
  voterName: string;

  @Prop({ default: '', trim: true })
  voterPhone: string;
}

export const VotePaymentSchema = SchemaFactory.createForClass(VotePayment);
