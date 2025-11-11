import { IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryThreeDto {
  @IsString()
  name: string;

  @IsString()
  category_heading_font_color: string;
}

export class CreateCategoryTwoDto {
  @IsString()
  name: string;

  @IsString()
  category_heading_font_color: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryThreeDto)
  subCategories?: CreateCategoryThreeDto[];
}

export class CreateCategoryOneDto {
  @IsString()
  name: string;

  @IsString()
  category_heading_font_color: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryTwoDto)
  subCategories?: CreateCategoryTwoDto[];
}

export class CreateMainCategoryDto {
  @IsString()
  name: string;

  @IsString()
  category_heading_font_color: string;

  @IsString()
  categories_color: string;

  @IsString()
  font_color: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryOneDto)
  subCategories?: CreateCategoryOneDto[];
}
