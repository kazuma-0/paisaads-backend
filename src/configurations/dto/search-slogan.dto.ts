import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SearchSloganDto {
  @ApiProperty({
    description: 'Main slogan text',
    example: 'Find Your Perfect Deal Today!',
  })
  @IsString()
  mainSlogan: string;

  @ApiProperty({
    description: 'Sub slogan text',
    required: false,
    example: 'Discover thousands of listings in your area',
  })
  @IsOptional()
  @IsString()
  subSlogan?: string;

  @ApiProperty({
    description: 'Show slogan on search page',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showOnSearchPage?: boolean;

  @ApiProperty({
    description: 'Show slogan on home page',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showOnHomePage?: boolean;

  @ApiProperty({ description: 'User who updated the slogan', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether slogan is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
