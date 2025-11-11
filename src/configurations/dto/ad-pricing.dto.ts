import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class AdPricingDto {
  @ApiProperty({ description: 'Price for line ads', example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  lineAdPrice: number;

  @ApiProperty({
    description: 'Price for poster ads',
    example: 200,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  posterAdPrice: number;

  @ApiProperty({ description: 'Price for video ads', example: 300, minimum: 0 })
  @IsNumber()
  @Min(0)
  videoAdPrice: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'INR',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'User who updated the pricing', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether pricing is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
