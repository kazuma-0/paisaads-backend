import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { AdType } from 'src/common/enums/ad-type';

export class CreateAdCommentDto {
  @IsEnum(AdStatus)
  @ApiProperty({ enum: AdStatus })
  actionType: AdStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  comment: string;

  @IsEnum(AdType)
  @ApiProperty({ enum: AdType, description: 'Type of ad: line or poster' })
  adType: AdType;

  @ValidateIf((o) => o.adType === AdType.LINE)
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Line Ad ID (required if adType is line)',
  })
  lineAdId?: string;

  @ValidateIf((o) => o.adType === AdType.POSTER)
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Poster Ad ID (required if adType is poster)',
  })
  posterAdId?: string;

  @ValidateIf((o) => o.adType === AdType.VIDEO)
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Video Ad ID (required if adType is poster)',
  })
  videoAdId?: string;
}
