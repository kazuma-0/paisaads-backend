import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  method: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: true })
  @IsString()
  details: string;

  @ApiProperty({ required: false })
  proofImageId: string; // The ID of uploaded payment proof

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Line Ad ID (required if payment is for a line ad)',
  })
  lineAdId?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Poster Ad ID (required if payment is for a poster ad)',
  })
  posterAdId?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Video Ad ID (required if payment is for a video ad)',
  })
  videoAdId?: string;
}
