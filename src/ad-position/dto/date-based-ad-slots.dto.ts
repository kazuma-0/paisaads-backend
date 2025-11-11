import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';
import { AdStatus } from 'src/common/enums/ad-status.enum';

export class CategoryDto {
  id: string;
  name: string;
  color?: string;
}

export class DateBasedSlotOccupancyDto {
  pageType: PageType;
  side: PositionType;
  position: number;
  activeAdsCount: number;
  maxCapacity: number;
  isOccupied: boolean;
  categories: CategoryDto[]; // Actual categories from ads
}

export class DateBasedAdSlotsOverviewDto {
  date: string;
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  slots: DateBasedSlotOccupancyDto[];
  categories: CategoryDto[]; // All unique categories for this date
}

export class DateBasedLineAdDto {
  id: string;
  title: string;
  content: string;
  pageType: PageType;
  status: AdStatus;
  createdAt: Date;
  updatedAt: Date;
  mainCategory?: CategoryDto;
  categoryOne?: CategoryDto;
  categoryTwo?: CategoryDto;
  categoryThree?: CategoryDto;
}

export class DateBasedLineAdsDto {
  date: string;
  homeAds: DateBasedLineAdDto[];
  categoryAds: DateBasedLineAdDto[];
  totalCount: number;
  categories: CategoryDto[]; // All unique categories for this date
}

export class AvailableDatesDto {
  dates: string[];
  totalDates: number;
}

export class DateBasedSlotAdDetailDto {
  id: string;
  title: string;
  content?: string;
  status: AdStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  adType: string;
  mainCategory?: CategoryDto;
  categoryOne?: CategoryDto;
  categoryTwo?: CategoryDto;
  categoryThree?: CategoryDto;
}

export class DateBasedSlotDetailsDto {
  date: string;
  pageType: PageType;
  side: PositionType;
  position: number;
  maxCapacity: number;
  currentOccupancy: number;
  ads: DateBasedSlotAdDetailDto[];
  categories: CategoryDto[]; // All unique categories in this slot
}
