import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { Type } from 'class-transformer';
import { MainCategory } from 'src/category/entities/main-category.entity';
import { CategoryOne } from 'src/category/entities/category-one.entity';
import { CategoryThree } from 'src/category/entities/category-three.entity';
import { CategoryTwo } from 'src/category/entities/category-two.entity';
import { PageType } from 'src/common/enums/page-type.enum';

export class CreateLineAdDto {
  @ApiProperty({ type: () => MainCategory })
  mainCategoryId: string;

  @ApiProperty({ type: () => CategoryOne, required: false })
  @IsOptional()
  categoryOneId?: string;

  @ApiProperty({ type: () => CategoryTwo, required: false })
  @IsOptional()
  categoryTwoId?: string;

  @ApiProperty({ type: () => CategoryThree, required: false })
  @IsOptional()
  categoryThreeId?: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsArray()
  @ArrayMaxSize(3)
  imageIds: string[]; // Image IDs or upload tokens

  @IsString()
  state: string;

  @IsNumber()
  @IsOptional()
  sid: number;

  @IsString()
  city: string;

  @IsNumber()
  @IsOptional()
  cid: number;

  @IsString()
  @IsOptional()
  postedBy: string;

  @IsNumber()
  contactOne: number;

  @IsNumber()
  @IsOptional()
  contactTwo?: number;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  textColor?: string;

  @IsArray()
  dates: string[]; // e.g., ['2024-05-03','2024-05-04']

  @IsEnum(PageType)
  pageType: PageType = PageType.HOME;
}
