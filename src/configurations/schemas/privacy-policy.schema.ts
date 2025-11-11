import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PrivacyPolicyDocument = PrivacyPolicy & Document;

@Schema({ timestamps: true })
export class PrivacyPolicy {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  version: string;

  @Prop({ default: Date.now })
  effectiveDate: Date;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PrivacyPolicySchema = SchemaFactory.createForClass(PrivacyPolicy);
