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

class CoordinatesDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  longitude: number;
}

class BusinessHoursDto {
  @ApiProperty({ description: 'Monday hours', example: '9:00 AM - 6:00 PM' })
  @IsString()
  monday: string;

  @ApiProperty({ description: 'Tuesday hours', example: '9:00 AM - 6:00 PM' })
  @IsString()
  tuesday: string;

  @ApiProperty({ description: 'Wednesday hours', example: '9:00 AM - 6:00 PM' })
  @IsString()
  wednesday: string;

  @ApiProperty({ description: 'Thursday hours', example: '9:00 AM - 6:00 PM' })
  @IsString()
  thursday: string;

  @ApiProperty({ description: 'Friday hours', example: '9:00 AM - 6:00 PM' })
  @IsString()
  friday: string;

  @ApiProperty({ description: 'Saturday hours', example: '9:00 AM - 2:00 PM' })
  @IsString()
  saturday: string;

  @ApiProperty({ description: 'Sunday hours', example: 'Closed' })
  @IsString()
  sunday: string;
}

export class ContactPageDto {
  @ApiProperty({ description: 'Company name', example: 'Paisa Ads' })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Primary email address',
    example: 'contact@paisaads.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Primary phone number',
    example: '+91 9876543210',
  })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Alternate phone number', required: false })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ description: 'Complete address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'GPS coordinates',
    type: CoordinatesDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiProperty({
    description: 'Social media links',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  socialMediaLinks?: string[];

  @ApiProperty({
    description: 'Business hours',
    type: BusinessHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto;

  @ApiProperty({ description: 'Support email', required: false })
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @ApiProperty({ description: 'Sales email', required: false })
  @IsOptional()
  @IsString()
  salesEmail?: string;

  @ApiProperty({ description: 'Emergency contact', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({
    description: 'User who updated the contact info',
    required: false,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether contact info is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
