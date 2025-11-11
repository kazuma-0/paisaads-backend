import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdPositionDto } from './dto/create-ad-position.dto';
import { UpdateAdPositionDto } from './dto/update-ad-position.dto';
import { AdPosition } from './entities/ad-position.entity';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { AdType } from 'src/common/enums/ad-type';
import {
  AdSlotsOverviewResponseDto,
  SlotOccupancyDto,
  LineAdsResponseDto,
  LineAdSummaryDto,
  SlotDetailsResponseDto,
  SlotAdDetailDto,
} from './dto/ad-slots-overview-response.dto';
import {
  DateBasedAdSlotsOverviewDto,
  DateBasedSlotOccupancyDto,
  DateBasedLineAdsDto,
  DateBasedLineAdDto,
  AvailableDatesDto,
  DateBasedSlotDetailsDto,
  DateBasedSlotAdDetailDto,
  CategoryDto,
} from './dto/date-based-ad-slots.dto';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';

@Injectable()
export class AdPositionService {
  constructor(
    @InjectRepository(AdPosition)
    private readonly adPositionRepository: Repository<AdPosition>,
    @InjectRepository(PosterAd)
    private readonly posterAdRepository: Repository<PosterAd>,
    @InjectRepository(VideoAd)
    private readonly videoAdRepository: Repository<VideoAd>,
    @InjectRepository(LineAd)
    private readonly lineAdRepository: Repository<LineAd>,
    @InjectRepository(MainCategory)
    private readonly mainCategoryRepository: Repository<MainCategory>,
  ) {}

  async create(createAdPositionDto: CreateAdPositionDto): Promise<AdPosition> {
    const adPosition = this.adPositionRepository.create(createAdPositionDto);
    return await this.adPositionRepository.save(adPosition);
  }

  async findAll(): Promise<AdPosition[]> {
    return await this.adPositionRepository.find({
      relations: ['videoAd', 'posterAd', 'lineAd'],
    });
  }

  async findOne(id: string): Promise<AdPosition | null> {
    return await this.adPositionRepository.findOne({
      where: { id },
      relations: ['videoAd', 'posterAd', 'lineAd'],
    });
  }

  async update(
    id: string,
    updateAdPositionDto: UpdateAdPositionDto,
  ): Promise<AdPosition | null> {
    await this.adPositionRepository.update(id, updateAdPositionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.adPositionRepository.delete(id);
  }

  private isAdActiveForDate(ad: any, targetDate: string): boolean {
    if (!ad.isActive || ad.status !== AdStatus.PUBLISHED) {
      return false;
    }

    if (!Array.isArray(ad.dates) || ad.dates.length === 0) {
      return false;
    }

    return ad.dates.some((dateStr: string) => {
      const dateOnly = dateStr.split('T')[0];
      return dateOnly === targetDate;
    });
  }

  private isAdActive(ad: any): boolean {
    console.log(`[DEBUG] isAdActive check for ad ${ad?.id}:`, {
      isActive: ad?.isActive,
      status: ad?.status,
      expectedStatus: AdStatus.PUBLISHED,
      statusMatch: ad?.status === AdStatus.PUBLISHED,
      datesLength: ad?.dates?.length,
      dates: ad?.dates,
    });

    if (!ad.isActive || ad.status !== AdStatus.PUBLISHED) {
      console.log(
        `[DEBUG] Ad ${ad?.id} rejected - not active or not published`,
      );
      return false;
    }

    if (!Array.isArray(ad.dates) || ad.dates.length === 0) {
      console.log(`[DEBUG] Ad ${ad?.id} rejected - no valid dates array`);
      return false;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISOString = today.toISOString().split('T')[0];

    console.log(
      `[DEBUG] Checking dates for ad ${ad?.id}. Today: ${todayISOString}`,
    );

    const isActiveToday = ad.dates.some((dateStr: string) => {
      const dateOnly = dateStr.split('T')[0];
      const matches = dateOnly === todayISOString;
      console.log(
        `[DEBUG] Date ${dateOnly} matches today ${todayISOString}: ${matches}`,
      );
      return matches;
    });

    console.log(`[DEBUG] Ad ${ad?.id} is active today: ${isActiveToday}`);
    return isActiveToday;
  }

  private getExpiryDate(dates: string[]): Date | undefined {
    if (!Array.isArray(dates) || dates.length === 0) {
      return undefined;
    }

    const latestDate = dates.reduce((latest, current) => {
      return new Date(current) > new Date(latest) ? current : latest;
    });

    return new Date(latestDate);
  }

  private categoryToDto(category: MainCategory): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      color: category.categories_color || undefined,
    };
  }

  private extractUniqueCategories(ads: any[]): CategoryDto[] {
    const categoriesMap = new Map<string, CategoryDto>();

    ads.forEach((ad) => {
      if (ad.mainCategory) {
        categoriesMap.set(
          ad.mainCategory.id,
          this.categoryToDto(ad.mainCategory),
        );
      }
    });

    return Array.from(categoriesMap.values());
  }

  async getAdSlotsOverview(
    pageType?: PageType,
    category?: string,
  ): Promise<AdSlotsOverviewResponseDto> {
    const slots: SlotOccupancyDto[] = [];
    const pageTypes = pageType
      ? [pageType]
      : [PageType.HOME, PageType.CATEGORY];
    const sides = [
      PositionType.LEFT_SIDE,
      PositionType.RIGHT_SIDE,
      PositionType.CENTER_TOP,
      PositionType.CENTER_BOTTOM,
    ];
    const maxCapacity = 5; // Maximum 5 ads per slot

    for (const page of pageTypes) {
      for (const side of sides) {
        const maxPositions =
          side === PositionType.CENTER_TOP ||
          side === PositionType.CENTER_BOTTOM
            ? 1
            : 6;

        for (let position = 1; position <= maxPositions; position++) {
          const adPositions = await this.adPositionRepository.find({
            where: {
              pageType: page,
              side,
              position:
                side === PositionType.CENTER_TOP ||
                side === PositionType.CENTER_BOTTOM
                  ? 0
                  : position,
              adType: AdType.POSTER, // Only poster and video ads use positioned slots
            },
            relations: ['posterAd', 'videoAd'],
          });

          const videoAdPositions = await this.adPositionRepository.find({
            where: {
              pageType: page,
              side,
              position:
                side === PositionType.CENTER_TOP ||
                side === PositionType.CENTER_BOTTOM
                  ? 0
                  : position,
              adType: AdType.VIDEO,
            },
            relations: ['videoAd'],
          });

          const allPositions = [...adPositions, ...videoAdPositions];

          const activeAds = allPositions.filter((pos) => {
            const ad = pos.posterAd || pos.videoAd;
            return ad && this.isAdActive(ad);
          });

          let earliestExpiryDate: Date | undefined;
          let latestExpiryDate: Date | undefined;

          if (activeAds.length > 0) {
            const expiryDates = activeAds
              .map((pos) => {
                const ad = pos.posterAd || pos.videoAd;
                return ad ? this.getExpiryDate(ad.dates) : undefined;
              })
              .filter((date) => date !== undefined);

            if (expiryDates.length > 0) {
              earliestExpiryDate = new Date(
                Math.min(...expiryDates.map((d) => d.getTime())),
              );
              latestExpiryDate = new Date(
                Math.max(...expiryDates.map((d) => d.getTime())),
              );
            }
          }

          let categoryId: string | undefined;
          let categoryName: string | undefined;

          slots.push({
            pageType: page,
            side,
            position,
            activeAdsCount: activeAds.length,
            maxCapacity,
            isOccupied: activeAds.length > 0,
            earliestExpiryDate: earliestExpiryDate?.toISOString(),
            latestExpiryDate: latestExpiryDate?.toISOString(),
            categoryId,
            categoryName,
          });
        }
      }
    }

    let filteredSlots = slots;
    if (category && pageType === PageType.CATEGORY) {
      filteredSlots = slots.filter((slot) => slot.categoryId === category);
    }

    const totalSlots = filteredSlots.length;
    const occupiedSlots = filteredSlots.filter(
      (slot) => slot.isOccupied,
    ).length;
    const freeSlots = totalSlots - occupiedSlots;

    return {
      totalSlots,
      occupiedSlots,
      freeSlots,
      slots: filteredSlots,
    };
  }

  async getLineAds(
    pageType?: PageType,
    category?: string,
  ): Promise<LineAdsResponseDto> {
    const whereConditions: any = {
      adType: AdType.LINE,
    };

    if (pageType) {
      whereConditions.pageType = pageType;
    }

    const lineAdPositions = await this.adPositionRepository.find({
      where: whereConditions,
      relations: ['lineAd', 'lineAd.customer', 'lineAd.customer.user'],
      order: {
        lineAd: {
          updated_at: 'DESC',
        },
      },
    });

    const activeLineAds = lineAdPositions
      .filter((pos) => pos.lineAd && this.isAdActive(pos.lineAd))
      .map((pos) => pos.lineAd);

    const homeAds: LineAdSummaryDto[] = [];
    const categoryAds: LineAdSummaryDto[] = [];

    for (const ad of activeLineAds) {
      const adPosition = await this.adPositionRepository.findOne({
        where: { lineAd: { id: ad.id } },
      });

      let categoryId: string | undefined;
      let categoryName: string | undefined;

      const summary: LineAdSummaryDto = {
        id: ad.id,
        title:
          ad.content.substring(0, 50) + (ad.content.length > 50 ? '...' : ''), // Use first 50 chars as title
        content: ad.content,
        pageType: adPosition?.pageType || PageType.HOME,
        status: ad.status,
        expiryDate: this.getExpiryDate(ad.dates)?.toISOString(),
        createdAt: ad.created_at,
        updatedAt: ad.updated_at,
        categoryId,
        categoryName,
      };

      if (adPosition?.pageType === PageType.HOME) {
        homeAds.push(summary);
      } else {
        categoryAds.push(summary);
      }
    }

    let filteredCategoryAds = categoryAds;
    if (category && pageType === PageType.CATEGORY) {
      filteredCategoryAds = categoryAds.filter(
        (ad) => ad.categoryId === category,
      );
    }

    return {
      homeAds,
      categoryAds: filteredCategoryAds,
      totalCount: homeAds.length + filteredCategoryAds.length,
    };
  }

  async getSlotDetails(
    pageType: PageType,
    side: PositionType,
    position: number,
    category?: string,
  ): Promise<SlotDetailsResponseDto> {
    const maxCapacity = 5;
    const actualPosition =
      side === PositionType.CENTER_TOP || side === PositionType.CENTER_BOTTOM
        ? 0
        : position;

    const posterAdPositions = await this.adPositionRepository.find({
      where: {
        pageType,
        side,
        position: actualPosition,
        adType: AdType.POSTER,
      },
      relations: ['posterAd', 'posterAd.customer', 'posterAd.customer.user'],
    });

    const videoAdPositions = await this.adPositionRepository.find({
      where: {
        pageType,
        side,
        position: actualPosition,
        adType: AdType.VIDEO,
      },
      relations: ['videoAd', 'videoAd.customer', 'videoAd.customer.user'],
    });

    const allPositions = [...posterAdPositions, ...videoAdPositions];

    const ads: SlotAdDetailDto[] = allPositions
      .map((pos) => {
        const ad = pos.posterAd || pos.videoAd;
        if (!ad) return null;

        let categoryId: string | undefined;
        let categoryName: string | undefined;

        return {
          id: ad.id,
          title: pos.posterAd
            ? `Poster Ad by ${ad.postedBy}`
            : `Video Ad by ${ad.postedBy}`, // Create title from available data
          content: undefined, // Poster and Video ads don't have content field
          status: ad.status,
          isActive: this.isAdActive(ad),
          expiryDate: this.getExpiryDate(ad.dates),
          createdAt: ad.created_at,
          updatedAt: ad.updated_at,
          customerName: ad.customer?.user?.name || 'Unknown',
          adType: pos.posterAd ? 'POSTER' : 'VIDEO',
          categoryId,
          categoryName,
        };
      })
      .filter((ad) => ad !== null) as SlotAdDetailDto[];

    return {
      pageType,
      side,
      position,
      maxCapacity,
      currentOccupancy: ads.filter((ad) => ad.isActive).length,
      ads,
    };
  }

  async getAvailableDates(): Promise<AvailableDatesDto> {
    const [lineAds, posterAds, videoAds] = await Promise.all([
      this.lineAdRepository.find({
        where: { isActive: true, status: AdStatus.PUBLISHED },
        select: ['dates'],
      }),
      this.posterAdRepository.find({
        where: { isActive: true, status: AdStatus.PUBLISHED },
        select: ['dates'],
      }),
      this.videoAdRepository.find({
        where: { isActive: true, status: AdStatus.PUBLISHED },
        select: ['dates'],
      }),
    ]);

    const allDates = new Set<string>();

    [...lineAds, ...posterAds, ...videoAds].forEach((ad) => {
      if (ad.dates && Array.isArray(ad.dates)) {
        ad.dates.forEach((dateStr) => {
          const dateOnly = dateStr.split('T')[0];
          allDates.add(dateOnly);
        });
      }
    });

    const sortedDates = Array.from(allDates).sort();

    return {
      dates: sortedDates,
      totalDates: sortedDates.length,
    };
  }

  async getAdSlotsByDate(
    date: string,
    pageType?: PageType,
    category?: string,
  ): Promise<DateBasedAdSlotsOverviewDto> {
    const slots: DateBasedSlotOccupancyDto[] = [];
    const pageTypes = pageType
      ? [pageType]
      : [PageType.HOME, PageType.CATEGORY];
    const sides = [
      PositionType.LEFT_SIDE,
      PositionType.RIGHT_SIDE,
      PositionType.CENTER_TOP,
      PositionType.CENTER_BOTTOM,
    ];
    const maxCapacity = 5;
    const allCategories = new Set<string>();

    for (const page of pageTypes) {
      for (const side of sides) {
        const maxPositions =
          side === PositionType.CENTER_TOP ||
          side === PositionType.CENTER_BOTTOM
            ? 1
            : 6;

        for (let position = 1; position <= maxPositions; position++) {
          const adPositions = await this.adPositionRepository.find({
            where: {
              pageType: page,
              side,
              position:
                side === PositionType.CENTER_TOP ||
                side === PositionType.CENTER_BOTTOM
                  ? 0
                  : position,
              adType: AdType.POSTER,
            },
            relations: [
              'posterAd',
              'posterAd.mainCategory',
              'posterAd.categoryOne',
              'posterAd.categoryTwo',
              'posterAd.categoryThree',
            ],
          });

          const videoAdPositions = await this.adPositionRepository.find({
            where: {
              pageType: page,
              side,
              position:
                side === PositionType.CENTER_TOP ||
                side === PositionType.CENTER_BOTTOM
                  ? 0
                  : position,
              adType: AdType.VIDEO,
            },
            relations: [
              'videoAd',
              'videoAd.mainCategory',
              'videoAd.categoryOne',
              'videoAd.categoryTwo',
              'videoAd.categoryThree',
            ],
          });

          const allPositions = [...adPositions, ...videoAdPositions];

          const activeAds = allPositions.filter((pos) => {
            const ad = pos.posterAd || pos.videoAd;
            return ad && this.isAdActiveForDate(ad, date);
          });

          const slotCategories: CategoryDto[] = [];
          activeAds.forEach((pos) => {
            const ad = pos.posterAd || pos.videoAd;
            if (ad && ad.mainCategory) {
              const categoryDto = this.categoryToDto(ad.mainCategory);
              slotCategories.push(categoryDto);
              allCategories.add(JSON.stringify(categoryDto));
            }
          });

          if (category && page === PageType.CATEGORY) {
            const hasCategory = activeAds.some((pos) => {
              const ad = pos.posterAd || pos.videoAd;
              return ad && ad.mainCategory && ad.mainCategory.id === category;
            });
            if (!hasCategory) continue;
          }

          slots.push({
            pageType: page,
            side,
            position,
            activeAdsCount: activeAds.length,
            maxCapacity,
            isOccupied: activeAds.length > 0,
            categories: slotCategories,
          });
        }
      }
    }

    const totalSlots = slots.length;
    const occupiedSlots = slots.filter((slot) => slot.isOccupied).length;
    const freeSlots = totalSlots - occupiedSlots;

    const uniqueCategories = Array.from(allCategories).map(
      (catStr) => JSON.parse(catStr) as CategoryDto,
    );

    return {
      date,
      totalSlots,
      occupiedSlots,
      freeSlots,
      slots,
      categories: uniqueCategories,
    };
  }

  async getLineAdsByDate(
    date: string,
    pageType?: PageType,
    category?: string,
  ): Promise<DateBasedLineAdsDto> {
    const whereConditions: any = {
      adType: AdType.LINE,
    };

    if (pageType) {
      whereConditions.pageType = pageType;
    }

    const lineAdPositions = await this.adPositionRepository.find({
      where: whereConditions,
      relations: [
        'lineAd',
        'lineAd.customer',
        'lineAd.customer.user',
        'lineAd.mainCategory',
        'lineAd.categoryOne',
        'lineAd.categoryTwo',
        'lineAd.categoryThree',
      ],
      order: {
        lineAd: {
          updated_at: 'DESC',
        },
      },
    });

    const activeLineAds = lineAdPositions
      .filter((pos) => pos.lineAd && this.isAdActiveForDate(pos.lineAd, date))
      .map((pos) => ({ ad: pos.lineAd, pageType: pos.pageType }));

    const homeAds: DateBasedLineAdDto[] = [];
    const categoryAds: DateBasedLineAdDto[] = [];
    const allCategories = new Set<string>();

    for (const { ad, pageType: adPageType } of activeLineAds) {
      const adDto: DateBasedLineAdDto = {
        id: ad.id,
        title:
          ad.content.substring(0, 50) + (ad.content.length > 50 ? '...' : ''),
        content: ad.content,
        pageType: adPageType || PageType.HOME,
        status: ad.status,
        createdAt: ad.created_at,
        updatedAt: ad.updated_at,
        mainCategory: ad.mainCategory
          ? this.categoryToDto(ad.mainCategory)
          : undefined,
        categoryOne: ad.categoryOne
          ? { id: ad.categoryOne.id, name: ad.categoryOne.name }
          : undefined,
        categoryTwo: ad.categoryTwo
          ? { id: ad.categoryTwo.id, name: ad.categoryTwo.name }
          : undefined,
        categoryThree: ad.categoryThree
          ? { id: ad.categoryThree.id, name: ad.categoryThree.name }
          : undefined,
      };

      if (ad.mainCategory) {
        allCategories.add(JSON.stringify(this.categoryToDto(ad.mainCategory)));
      }

      if (
        category &&
        adPageType === PageType.CATEGORY &&
        (!ad.mainCategory || ad.mainCategory.id !== category)
      ) {
        continue;
      }

      if (adPageType === PageType.HOME) {
        homeAds.push(adDto);
      } else {
        categoryAds.push(adDto);
      }
    }

    const uniqueCategories = Array.from(allCategories).map(
      (catStr) => JSON.parse(catStr) as CategoryDto,
    );

    return {
      date,
      homeAds,
      categoryAds,
      totalCount: homeAds.length + categoryAds.length,
      categories: uniqueCategories,
    };
  }

  async getSlotDetailsByDate(
    date: string,
    pageType: PageType,
    side: PositionType,
    position: number,
    category?: string,
  ): Promise<DateBasedSlotDetailsDto> {
    const maxCapacity = 5;
    const actualPosition =
      side === PositionType.CENTER_TOP || side === PositionType.CENTER_BOTTOM
        ? 0
        : position;

    const posterAdPositions = await this.adPositionRepository.find({
      where: {
        pageType,
        side,
        position: actualPosition,
        adType: AdType.POSTER,
      },
      relations: [
        'posterAd',
        'posterAd.customer',
        'posterAd.customer.user',
        'posterAd.mainCategory',
        'posterAd.categoryOne',
        'posterAd.categoryTwo',
        'posterAd.categoryThree',
      ],
    });

    const videoAdPositions = await this.adPositionRepository.find({
      where: {
        pageType,
        side,
        position: actualPosition,
        adType: AdType.VIDEO,
      },
      relations: [
        'videoAd',
        'videoAd.customer',
        'videoAd.customer.user',
        'videoAd.mainCategory',
        'videoAd.categoryOne',
        'videoAd.categoryTwo',
        'videoAd.categoryThree',
      ],
    });

    const allPositions = [...posterAdPositions, ...videoAdPositions];
    const allCategories = new Set<string>();

    const ads: DateBasedSlotAdDetailDto[] = allPositions
      .map((pos) => {
        const ad = pos.posterAd || pos.videoAd;
        if (!ad) return null;

        const isActive = this.isAdActiveForDate(ad, date);

        if (ad.mainCategory) {
          allCategories.add(
            JSON.stringify(this.categoryToDto(ad.mainCategory)),
          );
        }

        if (
          category &&
          pageType === PageType.CATEGORY &&
          (!ad.mainCategory || ad.mainCategory.id !== category)
        ) {
          return null;
        }

        return {
          id: ad.id,
          title: pos.posterAd
            ? `Poster Ad by ${ad.postedBy}`
            : `Video Ad by ${ad.postedBy}`,
          content: undefined,
          status: ad.status,
          isActive,
          createdAt: ad.created_at,
          updatedAt: ad.updated_at,
          customerName: ad.customer?.user?.name || 'Unknown',
          adType: pos.posterAd ? 'POSTER' : 'VIDEO',
          mainCategory: ad.mainCategory
            ? this.categoryToDto(ad.mainCategory)
            : undefined,
          categoryOne: ad.categoryOne
            ? { id: ad.categoryOne.id, name: ad.categoryOne.name }
            : undefined,
          categoryTwo: ad.categoryTwo
            ? { id: ad.categoryTwo.id, name: ad.categoryTwo.name }
            : undefined,
          categoryThree: ad.categoryThree
            ? { id: ad.categoryThree.id, name: ad.categoryThree.name }
            : undefined,
        };
      })
      .filter((ad) => ad !== null) as DateBasedSlotAdDetailDto[];

    const uniqueCategories = Array.from(allCategories).map(
      (catStr) => JSON.parse(catStr) as CategoryDto,
    );

    return {
      date,
      pageType,
      side,
      position,
      maxCapacity,
      currentOccupancy: ads.filter((ad) => ad.isActive).length,
      ads,
      categories: uniqueCategories,
    };
  }
}
