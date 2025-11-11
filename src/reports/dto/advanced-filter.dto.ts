import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { AdStatus } from '../../common/enums/ad-status.enum';
import { AdType } from '../../common/enums/ad-type';

export class AdvancedFilterDto {
  @ApiProperty({
    description: 'Start date for filtering ads by creation date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering ads by creation date',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by ad type',
    enum: AdType,
    example: AdType.LINE,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdType)
  adType?: AdType;

  @ApiProperty({
    description: 'Filter by multiple ad types',
    enum: AdType,
    isArray: true,
    example: [AdType.LINE, AdType.POSTER],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdType, { each: true })
  @Transform(({ value }) => {
    console.log('DEBUG DTO Transform - adTypes:', {
      originalValue: value,
      valueType: typeof value,
      valueIsArray: Array.isArray(value),
      valueConstructor: value?.constructor?.name,
    });

    if (typeof value === 'string') {
      const result = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      console.log('DEBUG DTO Transform - adTypes result:', result);
      return result;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (value == null) {
      return undefined;
    }

    console.warn(
      'DEBUG DTO Transform - adTypes unexpected type, converting:',
      value,
    );
    if (typeof value === 'object' && value.length !== undefined) {
      try {
        return Array.from(value);
      } catch (error) {
        console.error(
          'DEBUG DTO Transform - adTypes failed to convert array-like object:',
          error,
        );
        return undefined;
      }
    }

    return [value];
  })
  adTypes?: AdType[];

  @ApiProperty({
    description: 'Filter by user type (posted by)',
    example: 'Owner',
    required: false,
  })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiProperty({
    description: 'Filter by multiple user types (posted by)',
    example: ['Owner', 'Agent', 'Dealer'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    console.log('DEBUG DTO Transform - userTypes:', {
      originalValue: value,
      valueType: typeof value,
      valueIsArray: Array.isArray(value),
      valueConstructor: value?.constructor?.name,
    });

    if (typeof value === 'string') {
      const result = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      console.log('DEBUG DTO Transform - userTypes result:', result);
      return result;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (value == null) {
      return undefined;
    }

    console.warn(
      'DEBUG DTO Transform - userTypes unexpected type, converting:',
      value,
    );
    if (typeof value === 'object' && value.length !== undefined) {
      try {
        return Array.from(value);
      } catch (error) {
        console.error(
          'DEBUG DTO Transform - userTypes failed to convert array-like object:',
          error,
        );
        return undefined;
      }
    }

    return [value];
  })
  userTypes?: string[];

  @ApiProperty({
    description: 'Filter by approval status',
    enum: AdStatus,
    example: AdStatus.PUBLISHED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @ApiProperty({
    description: 'Filter by multiple approval statuses',
    enum: AdStatus,
    isArray: true,
    example: [AdStatus.PUBLISHED, AdStatus.FOR_REVIEW],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdStatus, { each: true })
  @Transform(({ value }) => {
    console.log('DEBUG DTO Transform - statuses:', {
      originalValue: value,
      valueType: typeof value,
      valueIsArray: Array.isArray(value),
      valueConstructor: value?.constructor?.name,
    });

    if (typeof value === 'string') {
      const result = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      console.log('DEBUG DTO Transform - statuses result:', result);
      return result;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (value == null) {
      return undefined;
    }

    console.warn(
      'DEBUG DTO Transform - statuses unexpected type, converting:',
      value,
    );
    if (typeof value === 'object' && value.length !== undefined) {
      try {
        return Array.from(value);
      } catch (error) {
        console.error(
          'DEBUG DTO Transform - statuses failed to convert array-like object:',
          error,
        );
        return undefined;
      }
    }

    return [value];
  })
  statuses?: AdStatus[];

  @ApiProperty({
    description: 'Filter by state name',
    example: 'Maharashtra',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'Filter by state ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stateId?: number;

  @ApiProperty({
    description: 'Filter by city name',
    example: 'Mumbai',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Filter by city ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityId?: number;

  @ApiProperty({
    description: 'Filter by main category ID',
    example: 'uuid-main-category',
    required: false,
  })
  @IsOptional()
  @IsString()
  mainCategoryId?: string;

  @ApiProperty({
    description: 'Filter by category one ID',
    example: 'uuid-category-one',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryOneId?: string;

  @ApiProperty({
    description: 'Filter by category two ID',
    example: 'uuid-category-two',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryTwoId?: string;

  @ApiProperty({
    description: 'Filter by category three ID',
    example: 'uuid-category-three',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryThreeId?: string;

  @ApiProperty({
    description:
      'Filter by any category ID (searches across all category levels)',
    example: 'uuid-any-category',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search text in ad content (for line ads)',
    example: 'apartment for rent',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiProperty({
    description: 'Filter by customer ID',
    example: 'uuid-customer-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'created_at',
    default: 'created_at',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Include only active ads',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isActive?: boolean = true;
}

export class AdvancedFilterResponse<T> {
  @ApiProperty({ description: 'Array of filtered ads' })
  data: T[];

  @ApiProperty({ description: 'Total count of ads matching the filter' })
  totalCount: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrevious: boolean;

  constructor(data: T[], totalCount: number, page: number, limit: number) {
    this.data = data;
    this.totalCount = totalCount;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(totalCount / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}
