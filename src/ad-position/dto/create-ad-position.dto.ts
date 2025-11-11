import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { AdType } from 'src/common/enums/ad-type';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';

export class CreateAdPositionDto {
  @IsEnum(AdType)
  adType: AdType;

  @IsEnum(PageType)
  pageType: PageType = PageType.HOME;

  @IsOptional()
  @IsEnum(PositionType)
  side?: PositionType;

  @IsInt()
  @Min(1)
  @Max(6)
  position: number;
}
