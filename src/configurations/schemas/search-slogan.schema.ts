import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchSloganDocument = SearchSlogan & Document;

@Schema({ timestamps: true })
export class SearchSlogan {
  @Prop({ required: true })
  mainSlogan: string;

  @Prop()
  subSlogan: string;

  @Prop({ default: true })
  showOnSearchPage: boolean;

  @Prop({ default: true })
  showOnHomePage: boolean;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SearchSloganSchema = SchemaFactory.createForClass(SearchSlogan);
