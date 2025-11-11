import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsArray,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { MainCategory } from 'src/category/entities/main-category.entity';
import { CategoryOne } from 'src/category/entities/category-one.entity';
import { CategoryTwo } from 'src/category/entities/category-two.entity';
import { CategoryThree } from 'src/category/entities/category-three.entity';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';

export class CreatePosterAdDto {
  @ApiProperty({ type: () => MainCategory })
  @IsUUID()
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

  @ApiProperty({ description: 'Image ID or upload token' })
  @IsString()
  imageId: string;

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
  postedBy: string;

  @IsArray()
  dates: string[]; // e.g., ['2024-05-03','2024-05-04']

  @IsEnum(PageType)
  pageType: PageType;

  @IsEnum(PositionType)
  side: PositionType;

  @IsOptional()
  position: number;
}
