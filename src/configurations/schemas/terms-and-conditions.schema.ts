import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TermsAndConditionsDocument = TermsAndConditions & Document;

@Schema({ timestamps: true })
export class TermsAndConditions {
  @Prop({ required: true })
  content: '';

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const TermsAndConditionsSchema =
  SchemaFactory.createForClass(TermsAndConditions);
