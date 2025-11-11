import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AboutUsDocument = AboutUs & Document;

@Schema({ timestamps: true })
export class AboutUs {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  mission: string;

  @Prop()
  vision: string;

  @Prop({ type: [String] })
  values: string[];

  @Prop()
  foundedYear: number;

  @Prop()
  founderName: string;

  @Prop()
  companyDescription: string;

  @Prop({
    type: [{ name: String, position: String, bio: String, image: String }],
  })
  teamMembers: Array<{
    name: string;
    position: string;
    bio: string;
    image: string;
  }>;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AboutUsSchema = SchemaFactory.createForClass(AboutUs);
