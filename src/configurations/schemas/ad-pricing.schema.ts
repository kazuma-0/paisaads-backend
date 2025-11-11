import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdPricingDocument = AdPricing & Document;

@Schema({ timestamps: true })
export class AdPricing {
  @Prop({ required: true, min: 0 })
  lineAdPrice: number;

  @Prop({ required: true, min: 0 })
  posterAdPrice: number;

  @Prop({ required: true, min: 0 })
  videoAdPrice: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AdPricingSchema = SchemaFactory.createForClass(AdPricing);
