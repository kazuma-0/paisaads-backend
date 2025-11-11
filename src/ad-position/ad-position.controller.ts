import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdPositionService } from './ad-position.service';
import { CreateAdPositionDto } from './dto/create-ad-position.dto';
import { UpdateAdPositionDto } from './dto/update-ad-position.dto';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';
import {
  AdSlotsOverviewResponseDto,
  LineAdsResponseDto,
  SlotDetailsResponseDto,
} from './dto/ad-slots-overview-response.dto';
import {
  DateBasedAdSlotsOverviewDto,
  DateBasedLineAdsDto,
  AvailableDatesDto,
  DateBasedSlotDetailsDto,
} from './dto/date-based-ad-slots.dto';

@Controller('ad-position')
export class AdPositionController {
  constructor(private readonly adPositionService: AdPositionService) {}

  @Post()
  create(@Body() createAdPositionDto: CreateAdPositionDto) {
    return this.adPositionService.create(createAdPositionDto);
  }

  @Get()
  findAll() {
    return this.adPositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adPositionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdPositionDto: UpdateAdPositionDto,
  ) {
    return this.adPositionService.update(id, updateAdPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adPositionService.remove(id);
  }

  @Get('ad-slots/overview')
  async getAdSlotsOverview(
    @Query('pageType') pageType?: PageType,
    @Query('category') category?: string,
  ): Promise<AdSlotsOverviewResponseDto> {
    try {
      if (pageType && !Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getAdSlotsOverview(
        pageType,
        category,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch ad slots overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/line-ads')
  async getLineAds(
    @Query('pageType') pageType?: PageType,
    @Query('category') category?: string,
  ): Promise<LineAdsResponseDto> {
    try {
      if (pageType && !Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getLineAds(pageType, category);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch line ads',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/slot-details/:pageType/:side/:position')
  async getSlotDetails(
    @Param('pageType') pageType: PageType,
    @Param('side') side: PositionType,
    @Param('position') position: string,
    @Query('category') category?: string,
  ): Promise<SlotDetailsResponseDto> {
    try {
      if (!Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Object.values(PositionType).includes(side)) {
        throw new HttpException(
          `Invalid side. Must be one of: ${Object.values(PositionType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const positionNum = parseInt(position, 10);
      if (isNaN(positionNum) || positionNum < 1 || positionNum > 6) {
        throw new HttpException(
          'Invalid position. Must be a number between 1 and 6',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        (side === PositionType.CENTER_TOP ||
          side === PositionType.CENTER_BOTTOM) &&
        positionNum !== 1
      ) {
        throw new HttpException(
          'CENTER_TOP and CENTER_BOTTOM positions only support position 1',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getSlotDetails(
        pageType,
        side,
        positionNum,
        category,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch slot details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/available-dates')
  async getAvailableDates(): Promise<AvailableDatesDto> {
    try {
      return await this.adPositionService.getAvailableDates();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch available dates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/by-date/overview')
  async getAdSlotsByDate(
    @Query('date') date: string,
    @Query('pageType') pageType?: PageType,
    @Query('category') category?: string,
  ): Promise<DateBasedAdSlotsOverviewDto> {
    try {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new HttpException(
          'Invalid date format. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (pageType && !Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getAdSlotsByDate(
        date,
        pageType,
        category,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch ad slots by date',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/by-date/line-ads')
  async getLineAdsByDate(
    @Query('date') date: string,
    @Query('pageType') pageType?: PageType,
    @Query('category') category?: string,
  ): Promise<DateBasedLineAdsDto> {
    try {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new HttpException(
          'Invalid date format. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (pageType && !Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getLineAdsByDate(
        date,
        pageType,
        category,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch line ads by date',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ad-slots/by-date/slot-details/:pageType/:side/:position')
  async getSlotDetailsByDate(
    @Query('date') date: string,
    @Param('pageType') pageType: PageType,
    @Param('side') side: PositionType,
    @Param('position') position: string,
    @Query('category') category?: string,
  ): Promise<DateBasedSlotDetailsDto> {
    try {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new HttpException(
          'Invalid date format. Use YYYY-MM-DD',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Object.values(PageType).includes(pageType)) {
        throw new HttpException(
          `Invalid pageType. Must be one of: ${Object.values(PageType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Object.values(PositionType).includes(side)) {
        throw new HttpException(
          `Invalid side. Must be one of: ${Object.values(PositionType).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const positionNum = parseInt(position, 10);
      if (isNaN(positionNum) || positionNum < 1 || positionNum > 6) {
        throw new HttpException(
          'Invalid position. Must be a number between 1 and 6',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        (side === PositionType.CENTER_TOP ||
          side === PositionType.CENTER_BOTTOM) &&
        positionNum !== 1
      ) {
        throw new HttpException(
          'CENTER_TOP and CENTER_BOTTOM positions only support position 1',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.adPositionService.getSlotDetailsByDate(
        date,
        pageType,
        side,
        positionNum,
        category,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch slot details by date',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
