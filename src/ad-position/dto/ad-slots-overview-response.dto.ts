import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';

export class SlotOccupancyDto {
  pageType: PageType;
  side: PositionType;
  position: number;
  activeAdsCount: number;
  maxCapacity: number;
  isOccupied: boolean;
  earliestExpiryDate?: string;
  latestExpiryDate?: string;
  categoryId?: string;
  categoryName?: string;
}

export class AdSlotsOverviewResponseDto {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  slots: SlotOccupancyDto[];
}

export class LineAdSummaryDto {
  id: string;
  title: string;
  content: string;
  pageType: PageType;
  status: string;
  expiryDate?: string;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string;
  categoryName?: string;
}

export class LineAdsResponseDto {
  homeAds: LineAdSummaryDto[];
  categoryAds: LineAdSummaryDto[];
  totalCount: number;
}

export class SlotAdDetailDto {
  id: string;
  title: string;
  content?: string;
  status: string;
  isActive: boolean;
  expiryDate?: string;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  adType: string;
  categoryId?: string;
  categoryName?: string;
}

export class SlotDetailsResponseDto {
  pageType: PageType;
  side: PositionType;
  position: number;
  maxCapacity: number;
  currentOccupancy: number;
  ads: SlotAdDetailDto[];
}
