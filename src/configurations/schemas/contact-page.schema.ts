import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactPageDocument = ContactPage & Document;

@Schema({ timestamps: true })
export class ContactPage {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  alternatePhone: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  postalCode: string;

  @Prop()
  country: string;

  @Prop({ type: { latitude: Number, longitude: Number } })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Prop({ type: [String] })
  socialMediaLinks: string[];

  @Prop({
    type: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
  })
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  @Prop()
  supportEmail: string;

  @Prop()
  salesEmail: string;

  @Prop()
  emergencyContact: string;

  @Prop()
  websiteUrl: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ContactPageSchema = SchemaFactory.createForClass(ContactPage);
