// schemas/contestant-score.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContestantScoreDocument = HydratedDocument<ContestantScore>;

@Schema()
export class ContestantScore {
  @Prop({ default: 0 })
  voteCount: number;

  @Prop({ default: Date.now })
  lastVotedAt: Date;
}

export const ContestantScoreSchema =
  SchemaFactory.createForClass(ContestantScore);
