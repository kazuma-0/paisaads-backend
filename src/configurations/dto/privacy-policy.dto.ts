import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class PrivacyPolicyDto {
  @ApiProperty({
    description: 'Privacy policy content in HTML or markdown format',
  })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Version of the privacy policy', example: '1.0' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Effective date of the policy', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @ApiProperty({ description: 'User who updated the policy', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether policy is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
