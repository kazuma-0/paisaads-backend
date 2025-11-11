import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FaqQuestionDto {
  @ApiProperty({ description: 'FAQ question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'FAQ answer' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Question category', example: 'General' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Display order', example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'Whether question is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FaqDto {
  @ApiProperty({
    description: 'FAQ questions and answers',
    type: [FaqQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqQuestionDto)
  questions: FaqQuestionDto[];

  @ApiProperty({
    description: 'FAQ categories',
    type: [String],
    example: ['General', 'Account', 'Payments', 'Ads', 'Technical'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ description: 'FAQ page introduction text', required: false })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiProperty({
    description: 'Contact information for additional help',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiProperty({ description: 'User who updated the FAQ', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether FAQ is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
