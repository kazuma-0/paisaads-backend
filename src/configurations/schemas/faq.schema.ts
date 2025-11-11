import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({
    type: [
      {
        question: String,
        answer: String,
        category: String,
        order: Number,
        isActive: { type: Boolean, default: true },
      },
    ],
    required: true,
  })
  questions: Array<{
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
  }>;

  @Prop({
    type: [String],
    default: ['General', 'Account', 'Payments', 'Ads', 'Technical'],
  })
  categories: string[];

  @Prop()
  introduction: string;

  @Prop()
  contactInfo: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
