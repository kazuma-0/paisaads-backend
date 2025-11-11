import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, Not, IsNull } from 'typeorm';
import { LineAd } from '../line-ad/entities/line-ad.entity';
import { PosterAd } from '../poster-ad/entities/poster-ad.entity';
import { VideoAd } from '../video-ad/entities/video-ad.entity';
import { User } from '../user/entities/user.entity';
import { Customer } from '../user/entities/customer.entity';
import { Admin } from '../user/entities/admin.entity';
import { Payment } from '../payment/entities/payment.entity';
import { AdComment } from '../ad-comments/entities/ad-comment.entity';
import { MainCategory } from '../category/entities/main-category.entity';
import { AdStatus } from '../common/enums/ad-status.enum';
import { Role } from '../common/enums/role.enum';
import { LineAdService } from '../line-ad/line-ad.service';
import { PosterAdService } from 'src/poster-ad/poster-ad.service';
import { VideoAdService } from 'src/video-ad/video-ad.service';
import { AdType } from 'src/common/enums/ad-type';
import {
  AdvancedFilterDto,
  AdvancedFilterResponse,
} from './dto/advanced-filter.dto';

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface UserRegistrationReport {
  summary: {
    total: number;
    active: number;
    inactive: number;
    growth: number;
  };
  data: Array<{
    period: string;
    count: number;
    activeCount: number;
    byRole: Record<string, number>;
    byGender?: Record<string, number>;
  }>;
}

export interface AdminActivityReport {
  summary: {
    totalActions: number;
    approvals: number;
    rejections: number;
    holds: number;
    avgTimeToAction: number;
  };
  adminBreakdown: Array<{
    adminId: string;
    adminName: string;
    totalActions: number;
    approvals: number;
    rejections: number;
    holds: number;
    avgTimeToAction: number;
  }>;
  timelineData: Array<{
    date: string;
    actions: number;
    approvals: number;
    rejections: number;
  }>;
}

export interface ListingAnalyticsReport {
  summary: {
    totalListings: number;
    withImages: number;
    withoutImages: number;
    avgApprovalTime: number;
  };
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalAds: number;
    activeAds: number;
    avgApprovalTime: number;
    withImages: number;
    withoutImages: number;
  }>;
  byUserType: Array<{
    userType: string;
    count: number;
    percentage: number;
  }>;
  approvalMetrics: {
    avgTimeToApprove: number;
    fastestApproval: number;
    slowestApproval: number;
  };
}

export interface PaymentReport {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
    successRate: number;
  };
  byProduct: Array<{
    product: string;
    revenue: number;
    transactions: number;
    avgValue: number;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    transactions: number;
  }>;
  timeline: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(LineAd)
    private lineAdRepository: Repository<LineAd>,
    @InjectRepository(PosterAd)
    private posterAdRepository: Repository<PosterAd>,
    @InjectRepository(VideoAd)
    private videoAdRepository: Repository<VideoAd>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(AdComment)
    private adCommentRepository: Repository<AdComment>,
    @InjectRepository(MainCategory)
    private mainCategoryRepository: Repository<MainCategory>,
    private readonly lineAdService: LineAdService,
    private readonly posterAdService: PosterAdService,
    private readonly videoAdService: VideoAdService,
  ) {}

  async getAdStats(
    type: AdType,
    status: AdStatus,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ) {
    switch (type) {
      case AdType.LINE:
        return await this.lineAdService.findAllByStatusAndTimeFrame(
          status,
          page,
          limit,
          startDate,
          endDate,
        );
      case AdType.POSTER:
        return await this.posterAdService.findAllByStatusAndTimeFrame(
          status,
          page,
          limit,
          startDate,
          endDate,
        );
      case AdType.VIDEO:
        return await this.videoAdService.findAllByStatusAndTimeFrame(
          status,
          page,
          limit,
          startDate,
          endDate,
        );
      default:
        return null;
    }
  }

  async getLineAdStats() {
    return this.lineAdService.getLineAdStats();
  }

  async getLineAdsByStatusAndTimeFrame(
    status: AdStatus,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.lineAdService.findAllByStatusAndTimeFrame(
      status,
      page,
      limit,
      startDate,
      endDate,
    );
  }

  async getFilteredAds(
    filters: AdvancedFilterDto,
  ): Promise<AdvancedFilterResponse<any>> {
    const { page = 1, limit = 10, adType, adTypes } = filters;

    console.log('DEBUG getFilteredAds - Filter data types:', {
      adType: typeof adType,
      adTypes: typeof adTypes,
      adTypesValue: adTypes,
      adTypesIsArray: Array.isArray(adTypes),
      statuses: typeof filters.statuses,
      statusesValue: filters.statuses,
      statusesIsArray: Array.isArray(filters.statuses),
      userTypes: typeof filters.userTypes,
      userTypesValue: filters.userTypes,
      userTypesIsArray: Array.isArray(filters.userTypes),
    });

    let typesToQuery: AdType[] = [];
    if (adType) {
      typesToQuery = [adType];
    } else if (adTypes && adTypes.length > 0) {
      if (!Array.isArray(adTypes)) {
        console.error(
          'ERROR: adTypes is not an array but has length property:',
          adTypes,
        );
        throw new Error('adTypes must be an array');
      }
      typesToQuery = adTypes;
    } else {
      typesToQuery = [AdType.LINE, AdType.POSTER, AdType.VIDEO];
    }

    let allResults: any[] = [];
    let totalCount = 0;

    for (const type of typesToQuery) {
      const { data, count } = await this.getFilteredAdsByType(type, filters);
      allResults = [...allResults, ...data];
      totalCount += count;
    }

    allResults = this.sortResults(
      allResults,
      filters.sortBy,
      filters.sortOrder,
    );

    const skip = (page - 1) * limit;
    const paginatedResults = allResults.slice(skip, skip + limit);

    return new AdvancedFilterResponse(
      paginatedResults,
      totalCount,
      page,
      limit,
    );
  }

  private async getFilteredAdsByType(
    adType: AdType,
    filters: AdvancedFilterDto,
  ): Promise<{ data: any[]; count: number }> {
    switch (adType) {
      case AdType.LINE:
        return this.getFilteredLineAds(filters);
      case AdType.POSTER:
        return this.getFilteredPosterAds(filters);
      case AdType.VIDEO:
        return this.getFilteredVideoAds(filters);
      default:
        return { data: [], count: 0 };
    }
  }

  private async getFilteredLineAds(
    filters: AdvancedFilterDto,
  ): Promise<{ data: LineAd[]; count: number }> {
    const query = this.lineAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .leftJoinAndSelect('ad.images', 'images')
      .leftJoinAndSelect('ad.comments', 'comments')
      .leftJoinAndSelect('ad.position', 'position')
      .leftJoinAndSelect('ad.payment', 'payment');

    this.applyCommonFilters(query, filters);
    this.applyLineAdSpecificFilters(query, filters);

    const countQuery = query.clone();
    const totalCount = await countQuery.getCount();

    const results = await query.getMany();
    return { data: results, count: totalCount };
  }

  private async getFilteredPosterAds(
    filters: AdvancedFilterDto,
  ): Promise<{ data: PosterAd[]; count: number }> {
    const query = this.posterAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .leftJoinAndSelect('ad.image', 'image')
      .leftJoinAndSelect('ad.comments', 'comments')
      .leftJoinAndSelect('ad.position', 'position')
      .leftJoinAndSelect('ad.payment', 'payment');

    this.applyCommonFilters(query, filters);

    const countQuery = query.clone();
    const totalCount = await countQuery.getCount();

    const results = await query.getMany();
    return { data: results, count: totalCount };
  }

  private async getFilteredVideoAds(
    filters: AdvancedFilterDto,
  ): Promise<{ data: VideoAd[]; count: number }> {
    const query = this.videoAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .leftJoinAndSelect('ad.image', 'image')
      .leftJoinAndSelect('ad.comments', 'comments')
      .leftJoinAndSelect('ad.position', 'position')
      .leftJoinAndSelect('ad.payment', 'payment');

    this.applyCommonFilters(query, filters);

    const countQuery = query.clone();
    const totalCount = await countQuery.getCount();

    const results = await query.getMany();
    return { data: results, count: totalCount };
  }

  private applyCommonFilters(
    query: SelectQueryBuilder<any>,
    filters: AdvancedFilterDto,
  ): void {
    if (filters.isActive !== undefined) {
      query.andWhere('ad.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('ad.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    } else if (filters.startDate) {
      query.andWhere('ad.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    } else if (filters.endDate) {
      query.andWhere('ad.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    if (filters.status) {
      query.andWhere('ad.status = :status', { status: filters.status });
    } else if (filters.statuses && filters.statuses.length > 0) {
      console.log('DEBUG applyCommonFilters - statuses filter:', {
        statusesType: typeof filters.statuses,
        statusesValue: filters.statuses,
        statusesIsArray: Array.isArray(filters.statuses),
        statusesLength: filters.statuses.length,
        statusesConstructor: filters.statuses.constructor.name,
      });

      if (!Array.isArray(filters.statuses)) {
        console.error(
          'ERROR: filters.statuses is not an array but has length property:',
          filters.statuses,
        );
        throw new Error('filters.statuses must be an array for IN query');
      }

      query.andWhere('ad.status IN (:...statuses)', {
        statuses: filters.statuses,
      });
    }

    if (filters.userType) {
      query.andWhere('ad.postedBy = :userType', { userType: filters.userType });
    } else if (filters.userTypes && filters.userTypes.length > 0) {
      console.log('DEBUG applyCommonFilters - userTypes filter:', {
        userTypesType: typeof filters.userTypes,
        userTypesValue: filters.userTypes,
        userTypesIsArray: Array.isArray(filters.userTypes),
        userTypesLength: filters.userTypes.length,
        userTypesConstructor: filters.userTypes.constructor.name,
      });

      if (!Array.isArray(filters.userTypes)) {
        console.error(
          'ERROR: filters.userTypes is not an array but has length property:',
          filters.userTypes,
        );
        throw new Error('filters.userTypes must be an array for IN query');
      }

      query.andWhere('ad.postedBy IN (:...userTypes)', {
        userTypes: filters.userTypes,
      });
    }

    if (filters.state) {
      query.andWhere('ad.state = :state', { state: filters.state });
    }
    if (filters.stateId) {
      query.andWhere('ad.sid = :stateId', { stateId: filters.stateId });
    }
    if (filters.city) {
      query.andWhere('ad.city = :city', { city: filters.city });
    }
    if (filters.cityId) {
      query.andWhere('ad.cid = :cityId', { cityId: filters.cityId });
    }

    if (filters.mainCategoryId) {
      query.andWhere('mainCategory.id = :mainCategoryId', {
        mainCategoryId: filters.mainCategoryId,
      });
    }
    if (filters.categoryOneId) {
      query.andWhere('categoryOne.id = :categoryOneId', {
        categoryOneId: filters.categoryOneId,
      });
    }
    if (filters.categoryTwoId) {
      query.andWhere('categoryTwo.id = :categoryTwoId', {
        categoryTwoId: filters.categoryTwoId,
      });
    }
    if (filters.categoryThreeId) {
      query.andWhere('categoryThree.id = :categoryThreeId', {
        categoryThreeId: filters.categoryThreeId,
      });
    }
    if (filters.categoryId) {
      query.andWhere(
        '(mainCategory.id = :categoryId OR categoryOne.id = :categoryId OR categoryTwo.id = :categoryId OR categoryThree.id = :categoryId)',
        { categoryId: filters.categoryId },
      );
    }

    if (filters.customerId) {
      query.andWhere('customer.id = :customerId', {
        customerId: filters.customerId,
      });
    }

    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query.orderBy(`ad.${sortField}`, sortOrder);
  }

  private applyLineAdSpecificFilters(
    query: SelectQueryBuilder<LineAd>,
    filters: AdvancedFilterDto,
  ): void {
    if (filters.searchText) {
      query.andWhere('ad.content LIKE :searchText', {
        searchText: `%${filters.searchText}%`,
      });
    }
  }

  private sortResults(
    results: any[],
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): any[] {
    return results.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'ASC' ? comparison : -comparison;
    });
  }

  async getFilteredAdStats(filters: AdvancedFilterDto): Promise<{
    totalAds: number;
    statusBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
    locationBreakdown: { states: any[]; cities: any[] };
    categoryBreakdown: any[];
    userTypeBreakdown: Record<string, number>;
  }> {
    const { adType, adTypes } = filters;

    let typesToQuery: AdType[] = [];
    if (adType) {
      typesToQuery = [adType];
    } else if (adTypes && adTypes.length > 0) {
      typesToQuery = adTypes;
    } else {
      typesToQuery = [AdType.LINE, AdType.POSTER, AdType.VIDEO];
    }

    let totalAds = 0;
    const statusBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};
    const userTypeBreakdown: Record<string, number> = {};
    const locationBreakdown = { states: [], cities: [] };
    const categoryBreakdown = [];

    for (const type of typesToQuery) {
      const stats = await this.getAdTypeStats(type, filters);
      totalAds += stats.total;

      Object.keys(stats.statusBreakdown).forEach((status) => {
        statusBreakdown[status] =
          (statusBreakdown[status] || 0) + stats.statusBreakdown[status];
      });

      typeBreakdown[type] = stats.total;

      Object.keys(stats.userTypeBreakdown).forEach((userType) => {
        userTypeBreakdown[userType] =
          (userTypeBreakdown[userType] || 0) +
          stats.userTypeBreakdown[userType];
      });
    }

    return {
      totalAds,
      statusBreakdown,
      typeBreakdown,
      locationBreakdown,
      categoryBreakdown,
      userTypeBreakdown,
    };
  }

  private async getAdTypeStats(
    adType: AdType,
    filters: AdvancedFilterDto,
  ): Promise<{
    total: number;
    statusBreakdown: Record<string, number>;
    userTypeBreakdown: Record<string, number>;
  }> {
    let repository: Repository<any>;
    switch (adType) {
      case AdType.LINE:
        repository = this.lineAdRepository;
        break;
      case AdType.POSTER:
        repository = this.posterAdRepository;
        break;
      case AdType.VIDEO:
        repository = this.videoAdRepository;
        break;
      default:
        return { total: 0, statusBreakdown: {}, userTypeBreakdown: {} };
    }

    const baseQuery = repository.createQueryBuilder('ad');
    this.applyCommonFilters(baseQuery, {
      ...filters,
      status: undefined,
      statuses: undefined,
      userType: undefined,
      userTypes: undefined,
    });

    const total = await baseQuery.clone().getCount();

    const statusBreakdown: Record<string, number> = {};
    for (const status of Object.values(AdStatus)) {
      const statusQuery = baseQuery.clone();
      statusQuery.andWhere('ad.status = :status', { status });
      statusBreakdown[status] = await statusQuery.getCount();
    }

    const userTypeResults = await baseQuery
      .clone()
      .select('ad.postedBy', 'userType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ad.postedBy')
      .orderBy({})
      .getRawMany();

    const userTypeBreakdown: Record<string, number> = {};
    userTypeResults.forEach((result) => {
      userTypeBreakdown[result.userType] = parseInt(result.count);
    });

    return { total, statusBreakdown, userTypeBreakdown };
  }

  async getCategoriesForFilters(): Promise<{
    mainCategories: any[];
    categoryOnes: any[];
    categoryTwos: any[];
    categoryThrees: any[];
  }> {
    const mainCategoriesQuery = this.lineAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .select(['mainCategory.id', 'mainCategory.name'])
      .where('ad.isActive = :isActive', { isActive: true })
      .groupBy('mainCategory.id, mainCategory.name');

    const categoryOnesQuery = this.lineAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .select(['categoryOne.id', 'categoryOne.name'])
      .where('ad.isActive = :isActive AND categoryOne.id IS NOT NULL', {
        isActive: true,
      })
      .groupBy('categoryOne.id, categoryOne.name');

    const categoryTwosQuery = this.lineAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .select(['categoryTwo.id', 'categoryTwo.name'])
      .where('ad.isActive = :isActive AND categoryTwo.id IS NOT NULL', {
        isActive: true,
      })
      .groupBy('categoryTwo.id, categoryTwo.name');

    const categoryThreesQuery = this.lineAdRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .select(['categoryThree.id', 'categoryThree.name'])
      .where('ad.isActive = :isActive AND categoryThree.id IS NOT NULL', {
        isActive: true,
      })
      .groupBy('categoryThree.id, categoryThree.name');

    const [mainCategories, categoryOnes, categoryTwos, categoryThrees] =
      await Promise.all([
        mainCategoriesQuery.getMany(),
        categoryOnesQuery.getMany(),
        categoryTwosQuery.getMany(),
        categoryThreesQuery.getMany(),
      ]);

    return {
      mainCategories: mainCategories
        .map((ad) => ad.mainCategory)
        .filter(Boolean),
      categoryOnes: categoryOnes.map((ad) => ad.categoryOne).filter(Boolean),
      categoryTwos: categoryTwos.map((ad) => ad.categoryTwo).filter(Boolean),
      categoryThrees: categoryThrees
        .map((ad) => ad.categoryThree)
        .filter(Boolean),
    };
  }

  /**
   * Get unique user types for filter dropdown
   */
  async getUserTypesForFilters(): Promise<string[]> {
    const lineAdUserTypes = await this.lineAdRepository
      .createQueryBuilder('ad')
      .select('DISTINCT ad.postedBy', 'userType')
      .where('ad.isActive = :isActive AND ad.postedBy IS NOT NULL', {
        isActive: true,
      })
      .getRawMany();

    const posterAdUserTypes = await this.posterAdRepository
      .createQueryBuilder('ad')
      .select('DISTINCT ad.postedBy', 'userType')
      .where('ad.isActive = :isActive AND ad.postedBy IS NOT NULL', {
        isActive: true,
      })
      .getRawMany();

    const videoAdUserTypes = await this.videoAdRepository
      .createQueryBuilder('ad')
      .select('DISTINCT ad.postedBy', 'userType')
      .where('ad.isActive = :isActive AND ad.postedBy IS NOT NULL', {
        isActive: true,
      })
      .getRawMany();

    const allUserTypes = [
      ...lineAdUserTypes,
      ...posterAdUserTypes,
      ...videoAdUserTypes,
    ];

    const uniqueUserTypes = [...new Set(allUserTypes.map((ut) => ut.userType))];
    return uniqueUserTypes.sort();
  }

  /**
   * Get unique locations for filter dropdowns
   */
  async getLocationsForFilters(): Promise<{
    states: Array<{ name: string; id?: number }>;
    cities: Array<{ name: string; id?: number; state: string }>;
  }> {
    const lineAdLocations = await this.lineAdRepository
      .createQueryBuilder('ad')
      .select(['ad.state', 'ad.sid', 'ad.city', 'ad.cid'])
      .where('ad.isActive = :isActive', { isActive: true })
      .getMany();

    const posterAdLocations = await this.posterAdRepository
      .createQueryBuilder('ad')
      .select(['ad.state', 'ad.sid', 'ad.city', 'ad.cid'])
      .where('ad.isActive = :isActive', { isActive: true })
      .getMany();

    const videoAdLocations = await this.videoAdRepository
      .createQueryBuilder('ad')
      .select(['ad.state', 'ad.sid', 'ad.city', 'ad.cid'])
      .where('ad.isActive = :isActive', { isActive: true })
      .getMany();

    const allLocations = [
      ...lineAdLocations,
      ...posterAdLocations,
      ...videoAdLocations,
    ];

    const stateMap = new Map();
    const cityMap = new Map();

    allLocations.forEach((ad) => {
      if (ad.state) {
        stateMap.set(ad.state, { name: ad.state, id: ad.sid });
      }
      if (ad.city && ad.state) {
        const cityKey = `${ad.city}-${ad.state}`;
        cityMap.set(cityKey, { name: ad.city, id: ad.cid, state: ad.state });
      }
    });

    return {
      states: Array.from(stateMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      cities: Array.from(cityMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  }

  /**
   * Export filtered ads data
   */
  async exportFilteredAds(
    filters: AdvancedFilterDto,
    format: 'csv' | 'excel' = 'csv',
  ): Promise<{
    data: string | Buffer;
    filename: string;
    contentType: string;
  }> {
    const exportFilters = { ...filters, limit: 10000, page: 1 };
    const result = await this.getFilteredAds(exportFilters);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `filtered-ads-${timestamp}.${format}`;

    if (format === 'csv') {
      const csvData = this.convertToCSV(result.data);
      return {
        data: csvData,
        filename,
        contentType: 'text/csv',
      };
    } else {
      const csvData = this.convertToCSV(result.data);
      return {
        data: csvData,
        filename: filename.replace('.excel', '.csv'),
        contentType: 'text/csv',
      };
    }
  }

  /**
   * Convert ads data to CSV format
   */
  private convertToCSV(ads: any[]): string {
    if (ads.length === 0) return '';

    const headers = [
      'ID',
      'Type',
      'Status',
      'Posted By',
      'Content/Description',
      'State',
      'City',
      'Main Category',
      'Category One',
      'Category Two',
      'Category Three',
      'Customer Name',
      'Customer Email',
      'Created At',
      'Updated At',
    ];

    const rows = ads.map((ad) => [
      ad.id,
      this.getAdType(ad),
      ad.status,
      ad.postedBy || '',
      ad.content || 'N/A',
      ad.state || '',
      ad.city || '',
      ad.mainCategory?.name || '',
      ad.categoryOne?.name || '',
      ad.categoryTwo?.name || '',
      ad.categoryThree?.name || '',
      ad.customer?.user?.name || '',
      ad.customer?.user?.email || '',
      ad.created_at,
      ad.updated_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Determine ad type from entity structure
   */
  private getAdType(ad: any): string {
    if (ad.content !== undefined) return 'LINE';
    if (ad.image && !ad.dates) return 'POSTER';
    if (ad.image && ad.dates) return 'VIDEO';
    return 'UNKNOWN';
  }

  /**
   * Get user registration report with date range and period grouping
   */
  async getUserRegistrationReport(
    dateRange: ReportDateRange,
  ): Promise<UserRegistrationReport> {
    const { startDate, endDate, period = 'daily' } = dateRange;

    const totalUsers = await this.userRepository.count({
      where: { created_at: Between(startDate, endDate) },
    });

    const activeUsers = await this.userRepository.count({
      where: {
        created_at: Between(startDate, endDate),
        isActive: true,
      },
    });

    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = startDate;

    const prevPeriodUsers = await this.userRepository.count({
      where: { created_at: Between(prevStartDate, prevEndDate) },
    });

    const growth =
      prevPeriodUsers > 0
        ? ((totalUsers - prevPeriodUsers) / prevPeriodUsers) * 100
        : 0;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .where('user.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    const users = await query.getMany();

    const data = this.groupUsersByPeriod(users, period);

    return {
      summary: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        growth: Math.round(growth * 100) / 100,
      },
      data,
    };
  }

  /**
   * Get active vs inactive users report
   */
  async getActiveVsInactiveUsersReport(): Promise<{
    active: number;
    inactive: number;
    percentage: { active: number; inactive: number };
  }> {
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const inactiveUsers = await this.userRepository.count({
      where: { isActive: false },
    });
    const total = activeUsers + inactiveUsers;

    return {
      active: activeUsers,
      inactive: inactiveUsers,
      percentage: {
        active: total > 0 ? Math.round((activeUsers / total) * 100) : 0,
        inactive: total > 0 ? Math.round((inactiveUsers / total) * 100) : 0,
      },
    };
  }

  /**
   * Get user login activity report (using updated_at as proxy)
   */
  async getUserLoginActivityReport(dateRange: ReportDateRange): Promise<any> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.updated_at BETWEEN :startDate AND :endDate', dateRange)
      .andWhere('user.isActive = :isActive', { isActive: true });

    const activeUsers = await query.getMany();

    const activityData = this.groupUsersByPeriod(
      activeUsers.map((user) => ({
        ...user,
        created_at: user.updated_at,
      })),
      dateRange.period || 'daily',
    );

    return {
      summary: {
        totalActiveUsers: activeUsers.length,
        avgDailyActive:
          activeUsers.length /
          this.getDaysDifference(dateRange.startDate, dateRange.endDate),
      },
      data: activityData,
    };
  }

  /**
   * Get user views per listing category (mock data - would need view tracking)
   */
  async getUserViewsByCategoryReport(): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      totalListings: number;
      estimatedViews: number;
      avgViewsPerListing: number;
    }>
  > {
    const categories = await this.mainCategoryRepository.find();
    const results: Array<{
      categoryId: string;
      categoryName: string;
      totalListings: number;
      estimatedViews: number;
      avgViewsPerListing: number;
    }> = [];

    for (const category of categories) {
      const [lineAds, posterAds, videoAds] = await Promise.all([
        this.lineAdRepository.count({
          where: { mainCategory: { id: category.id }, isActive: true },
        }),
        this.posterAdRepository.count({
          where: { mainCategory: { id: category.id }, isActive: true },
        }),
        this.videoAdRepository.count({
          where: { mainCategory: { id: category.id }, isActive: true },
        }),
      ]);

      const totalAds = lineAds + posterAds + videoAds;

      results.push({
        categoryId: category.id,
        categoryName: category.name,
        totalListings: totalAds,
        estimatedViews: totalAds * 50,
        avgViewsPerListing: 50,
      });
    }

    return results;
  }

  /**
   * Get admin activity report with detailed breakdown
   */
  async getAdminActivityReport(
    dateRange: ReportDateRange,
    adminId?: string,
  ): Promise<AdminActivityReport> {
    const { startDate, endDate } = dateRange;

    let query = this.adCommentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.admin', 'admin')
      .where('comment.actionTimestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('user.role IN (:...roles)', {
        roles: [Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER],
      });

    if (adminId) {
      query = query.andWhere('user.id = :adminId', { adminId });
    }

    const comments = await query.getMany();

    const totalActions = comments.length;
    const approvals = comments.filter(
      (c) => c.actionType === AdStatus.PUBLISHED,
    ).length;
    const rejections = comments.filter(
      (c) => c.actionType === AdStatus.REJECTED,
    ).length;
    const holds = comments.filter((c) => c.actionType === AdStatus.HOLD).length;

    const avgTimeToAction = this.calculateAvgTimeToAction(comments);
    const adminBreakdown = this.groupCommentsByAdmin(comments);
    const timelineData = this.groupCommentsByDate(
      comments,
      dateRange.period || 'daily',
    );

    return {
      summary: {
        totalActions,
        approvals,
        rejections,
        holds,
        avgTimeToAction,
      },
      adminBreakdown,
      timelineData,
    };
  }

  /**
   * Get admin user-wise activity report
   */
  async getAdminUserWiseActivityReport(dateRange: ReportDateRange): Promise<
    Array<{
      adminId: string;
      adminName: string;
      totalActions: number;
      approvals: number;
      rejections: number;
      holds: number;
      reviews: number;
    }>
  > {
    const { startDate, endDate } = dateRange;

    const admins = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.admin', 'admin')
      .where('user.role IN (:...roles)', {
        roles: [Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER],
      })
      .getMany();

    const adminActivities: Array<{
      adminId: string;
      adminName: string;
      totalActions: number;
      approvals: number;
      rejections: number;
      holds: number;
      reviews: number;
    }> = [];

    for (const admin of admins) {
      const comments = await this.adCommentRepository
        .createQueryBuilder('comment')
        .where('comment.user = :userId', { userId: admin.id })
        .andWhere('comment.actionTimestamp BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      const activities = {
        adminId: admin.id,
        adminName: admin.name,
        totalActions: comments.length,
        approvals: comments.filter((c) => c.actionType === AdStatus.PUBLISHED)
          .length,
        rejections: comments.filter((c) => c.actionType === AdStatus.REJECTED)
          .length,
        holds: comments.filter((c) => c.actionType === AdStatus.HOLD).length,
        reviews: comments.filter((c) => c.actionType === AdStatus.FOR_REVIEW)
          .length,
      };

      adminActivities.push(activities);
    }

    return adminActivities;
  }

  /**
   * Get admin activity by category
   */
  async getAdminActivityByCategoryReport(dateRange: ReportDateRange): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      totalActions: number;
      approvals: number;
      rejections: number;
      holds: number;
    }>
  > {
    const categories = await this.mainCategoryRepository.find();
    const results: Array<{
      categoryId: string;
      categoryName: string;
      totalActions: number;
      approvals: number;
      rejections: number;
      holds: number;
    }> = [];

    for (const category of categories) {
      const lineAdComments = await this.adCommentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.lineAd', 'lineAd')
        .leftJoin('lineAd.mainCategory', 'category')
        .leftJoin('comment.user', 'user')
        .where('category.id = :categoryId', { categoryId: category.id })
        .andWhere(
          'comment.actionTimestamp BETWEEN :startDate AND :endDate',
          dateRange,
        )
        .andWhere('user.role IN (:...roles)', {
          roles: [Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER],
        })
        .getMany();

      const posterAdComments = await this.adCommentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.posterAd', 'posterAd')
        .leftJoin('posterAd.mainCategory', 'category')
        .leftJoin('comment.user', 'user')
        .where('category.id = :categoryId', { categoryId: category.id })
        .andWhere(
          'comment.actionTimestamp BETWEEN :startDate AND :endDate',
          dateRange,
        )
        .andWhere('user.role IN (:...roles)', {
          roles: [Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER],
        })
        .getMany();

      const videoAdComments = await this.adCommentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.videoAd', 'videoAd')
        .leftJoin('videoAd.mainCategory', 'category')
        .leftJoin('comment.user', 'user')
        .where('category.id = :categoryId', { categoryId: category.id })
        .andWhere(
          'comment.actionTimestamp BETWEEN :startDate AND :endDate',
          dateRange,
        )
        .andWhere('user.role IN (:...roles)', {
          roles: [Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER],
        })
        .getMany();

      const allComments = [
        ...lineAdComments,
        ...posterAdComments,
        ...videoAdComments,
      ];

      results.push({
        categoryId: category.id,
        categoryName: category.name,
        totalActions: allComments.length,
        approvals: allComments.filter(
          (c) => c.actionType === AdStatus.PUBLISHED,
        ).length,
        rejections: allComments.filter(
          (c) => c.actionType === AdStatus.REJECTED,
        ).length,
        holds: allComments.filter((c) => c.actionType === AdStatus.HOLD).length,
      });
    }

    return results;
  }

  /**
   * Get comprehensive listing analytics report
   */
  async getListingAnalyticsReport(
    dateRange?: ReportDateRange,
  ): Promise<ListingAnalyticsReport> {
    const whereClause = dateRange
      ? { created_at: Between(dateRange.startDate, dateRange.endDate) }
      : {};

    const [lineAds, posterAds, videoAds] = await Promise.all([
      this.lineAdRepository.find({
        where: whereClause,
        relations: ['images', 'mainCategory', 'customer', 'comments'],
      }),
      this.posterAdRepository.find({
        where: whereClause,
        relations: ['image', 'mainCategory', 'customer', 'comments'],
      }),
      this.videoAdRepository.find({
        where: whereClause,
        relations: ['image', 'mainCategory', 'customer', 'comments'],
      }),
    ]);

    const allAds = [...lineAds, ...posterAds, ...videoAds];

    const totalListings = allAds.length;
    const withImages = allAds.filter((ad) => {
      if ('images' in ad && ad.images && ad.images.length > 0) {
        return true;
      }
      if ('image' in ad && ad.image) {
        return true;
      }
      return false;
    }).length;
    const withoutImages = totalListings - withImages;

    const avgApprovalTime = this.calculateAvgApprovalTime(allAds);
    const byCategory = await this.groupAdsByCategory(allAds);
    const byUserType = this.groupAdsByUserType(allAds);
    const approvalMetrics = this.calculateApprovalMetrics(allAds);

    return {
      summary: {
        totalListings,
        withImages,
        withoutImages,
        avgApprovalTime,
      },
      byCategory,
      byUserType,
      approvalMetrics,
    };
  }

  /**
   * Get active listings count by category
   */
  async getActiveListingsByCategory(): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      lineAds: number;
      posterAds: number;
      videoAds: number;
      total: number;
    }>
  > {
    const categories = await this.mainCategoryRepository.find();
    const results: Array<{
      categoryId: string;
      categoryName: string;
      lineAds: number;
      posterAds: number;
      videoAds: number;
      total: number;
    }> = [];

    for (const category of categories) {
      const [lineAds, posterAds, videoAds] = await Promise.all([
        this.lineAdRepository.count({
          where: {
            mainCategory: { id: category.id },
            status: AdStatus.PUBLISHED,
            isActive: true,
          },
        }),
        this.posterAdRepository.count({
          where: {
            mainCategory: { id: category.id },
            status: AdStatus.PUBLISHED,
            isActive: true,
          },
        }),
        this.videoAdRepository.count({
          where: {
            mainCategory: { id: category.id },
            status: AdStatus.PUBLISHED,
            isActive: true,
          },
        }),
      ]);

      results.push({
        categoryId: category.id,
        categoryName: category.name,
        lineAds,
        posterAds,
        videoAds,
        total: lineAds + posterAds + videoAds,
      });
    }

    return results;
  }

  /**
   * Get time taken to approve ads
   */
  async getApprovalTimeReport(): Promise<{
    summary: {
      totalApproved: number;
      avgTimeToApprove: number;
      fastestApproval: number;
      slowestApproval: number;
    };
    details: Array<{
      adId: string;
      adType: string;
      timeToApprove: number;
      approvedAt: Date;
      createdAt: Date;
    }>;
  }> {
    const approvedAds = await this.adCommentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.lineAd', 'lineAd')
      .leftJoinAndSelect('comment.posterAd', 'posterAd')
      .leftJoinAndSelect('comment.videoAd', 'videoAd')
      .where('comment.actionType = :status', { status: AdStatus.PUBLISHED })
      .getMany();

    const approvalTimes: Array<{
      adId: string;
      adType: string;
      timeToApprove: number;
      approvedAt: Date;
      createdAt: Date;
    }> = [];

    approvedAds.forEach((comment) => {
      const ad = comment.lineAd || comment.posterAd || comment.videoAd;
      if (ad) {
        const timeToApprove =
          new Date(comment.actionTimestamp).getTime() -
          new Date(ad.created_at).getTime();
        const hoursToApprove = timeToApprove / (1000 * 60 * 60);

        approvalTimes.push({
          adId: ad.id,
          adType: comment.lineAd
            ? 'LINE'
            : comment.posterAd
              ? 'POSTER'
              : 'VIDEO',
          timeToApprove: hoursToApprove,
          approvedAt: comment.actionTimestamp,
          createdAt: ad.created_at,
        });
      }
    });

    const avgTime =
      approvalTimes.length > 0
        ? approvalTimes.reduce((sum, item) => sum + item.timeToApprove, 0) /
          approvalTimes.length
        : 0;

    return {
      summary: {
        totalApproved: approvalTimes.length,
        avgTimeToApprove: avgTime,
        fastestApproval:
          approvalTimes.length > 0
            ? Math.min(...approvalTimes.map((t) => t.timeToApprove))
            : 0,
        slowestApproval:
          approvalTimes.length > 0
            ? Math.max(...approvalTimes.map((t) => t.timeToApprove))
            : 0,
      },
      details: approvalTimes,
    };
  }

  /**
   * Get listings by user who posted
   */
  async getListingsByUserReport(): Promise<any> {
    const customers = await this.customerRepository.find({
      relations: ['user', 'lineAds', 'posterAds', 'videoAds'],
    });

    return customers.map((customer) => ({
      userId: customer.user.id,
      userName: customer.user.name,
      userType: this.determineUserType(customer),
      lineAds: customer.lineAds?.length || 0,
      posterAds: customer.posterAds?.length || 0,
      videoAds: customer.videoAds?.length || 0,
      totalAds:
        (customer.lineAds?.length || 0) +
        (customer.posterAds?.length || 0) +
        (customer.videoAds?.length || 0),
      location: `${customer.city}, ${customer.state}`,
    }));
  }

  /**
   * Get comprehensive payment transaction report
   */
  async getPaymentTransactionReport(
    dateRange: ReportDateRange,
  ): Promise<PaymentReport> {
    const { startDate, endDate } = dateRange;

    const payments = await this.paymentRepository.find({
      where: { created_at: Between(startDate, endDate) },
      relations: ['customer', 'lineAd', 'posterAd', 'videoAd'],
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalTransactions = payments.length;
    const avgTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const byProduct = this.groupPaymentsByProduct(payments);
    const byCategory = await this.groupPaymentsByCategory(payments);
    const timeline = this.groupPaymentsByPeriod(
      payments,
      dateRange.period || 'daily',
    );

    return {
      summary: {
        totalRevenue,
        totalTransactions,
        avgTransactionValue,
        successRate: 100, // Assuming all payments in DB are successful
      },
      byProduct,
      byCategory,
      timeline,
    };
  }

  /**
   * Get revenue by product type
   */
  async getRevenueByProduct(): Promise<any> {
    const [lineAdPayments, posterAdPayments, videoAdPayments] =
      await Promise.all([
        this.paymentRepository.find({
          where: { lineAd: Not(IsNull()) },
          relations: ['lineAd'],
        }),
        this.paymentRepository.find({
          where: { posterAd: Not(IsNull()) },
          relations: ['posterAd'],
        }),
        this.paymentRepository.find({
          where: { videoAd: Not(IsNull()) },
          relations: ['videoAd'],
        }),
      ]);

    return {
      lineAds: {
        revenue: lineAdPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        transactions: lineAdPayments.length,
        avgValue:
          lineAdPayments.length > 0
            ? lineAdPayments.reduce((sum, p) => sum + Number(p.amount), 0) /
              lineAdPayments.length
            : 0,
      },
      posterAds: {
        revenue: posterAdPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        transactions: posterAdPayments.length,
        avgValue:
          posterAdPayments.length > 0
            ? posterAdPayments.reduce((sum, p) => sum + Number(p.amount), 0) /
              posterAdPayments.length
            : 0,
      },
      videoAds: {
        revenue: videoAdPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        transactions: videoAdPayments.length,
        avgValue:
          videoAdPayments.length > 0
            ? videoAdPayments.reduce((sum, p) => sum + Number(p.amount), 0) /
              videoAdPayments.length
            : 0,
      },
    };
  }

  /**
   * Get revenue by category
   */
  async getRevenueByCategoryReport(): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      transactions: number;
      avgTransactionValue: number;
    }>
  > {
    const categories = await this.mainCategoryRepository.find();
    const result: Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      transactions: number;
      avgTransactionValue: number;
    }> = [];

    for (const category of categories) {
      const categoryPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoin('payment.lineAd', 'lineAd')
        .leftJoin('payment.posterAd', 'posterAd')
        .leftJoin('payment.videoAd', 'videoAd')
        .leftJoin('lineAd.mainCategory', 'lineCategory')
        .leftJoin('posterAd.mainCategory', 'posterCategory')
        .leftJoin('videoAd.mainCategory', 'videoCategory')
        .where(
          'lineCategory.id = :categoryId OR posterCategory.id = :categoryId OR videoCategory.id = :categoryId',
          { categoryId: category.id },
        )
        .getMany();

      const revenue = categoryPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        revenue,
        transactions: categoryPayments.length,
        avgTransactionValue:
          categoryPayments.length > 0 ? revenue / categoryPayments.length : 0,
      });
    }

    return result;
  }

  private groupUsersByPeriod(users: any[], period: string): any[] {
    const grouped = new Map();

    users.forEach((user) => {
      const date = new Date(user.created_at);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          period: key,
          count: 0,
          activeCount: 0,
          byRole: {},
          byGender: {},
        });
      }

      const group = grouped.get(key);
      group.count++;
      if (user.isActive) group.activeCount++;

      group.byRole[user.role] = (group.byRole[user.role] || 0) + 1;
      if (user.customer?.gender) {
        group.byGender[user.customer.gender] =
          (group.byGender[user.customer.gender] || 0) + 1;
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    );
  }

  private groupCommentsByAdmin(comments: AdComment[]): any[] {
    const grouped = new Map();

    comments.forEach((comment) => {
      const adminId = comment.user.id;
      const adminName = comment.user.name;

      if (!grouped.has(adminId)) {
        grouped.set(adminId, {
          adminId,
          adminName,
          totalActions: 0,
          approvals: 0,
          rejections: 0,
          holds: 0,
          avgTimeToAction: 0,
        });
      }

      const group = grouped.get(adminId);
      group.totalActions++;

      switch (comment.actionType) {
        case AdStatus.PUBLISHED:
          group.approvals++;
          break;
        case AdStatus.REJECTED:
          group.rejections++;
          break;
        case AdStatus.HOLD:
          group.holds++;
          break;
      }
    });

    return Array.from(grouped.values());
  }

  private groupCommentsByDate(comments: AdComment[], period: string): any[] {
    const grouped = new Map();

    comments.forEach((comment) => {
      const date = new Date(comment.actionTimestamp);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          date: key,
          actions: 0,
          approvals: 0,
          rejections: 0,
        });
      }

      const group = grouped.get(key);
      group.actions++;

      if (comment.actionType === AdStatus.PUBLISHED) group.approvals++;
      if (comment.actionType === AdStatus.REJECTED) group.rejections++;
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  private async groupAdsByCategory(ads: any[]): Promise<any[]> {
    const categories = await this.mainCategoryRepository.find();
    const grouped = new Map();

    categories.forEach((category) => {
      grouped.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        totalAds: 0,
        activeAds: 0,
        avgApprovalTime: 0,
        withImages: 0,
        withoutImages: 0,
      });
    });

    ads.forEach((ad) => {
      const categoryId = ad.mainCategory?.id;
      if (categoryId && grouped.has(categoryId)) {
        const group = grouped.get(categoryId);
        group.totalAds++;
        if (ad.isActive && ad.status === AdStatus.PUBLISHED) group.activeAds++;

        const hasImages =
          ('images' in ad && ad.images && ad.images.length > 0) ||
          ('image' in ad && ad.image);
        if (hasImages) group.withImages++;
        else group.withoutImages++;
      }
    });

    return Array.from(grouped.values());
  }

  private groupAdsByUserType(ads: any[]): any[] {
    const grouped = new Map();

    ads.forEach((ad) => {
      const userType = this.determineUserType(ad.customer);

      if (!grouped.has(userType)) {
        grouped.set(userType, { userType, count: 0 });
      }

      grouped.get(userType).count++;
    });

    const total = ads.length;
    return Array.from(grouped.values()).map((group) => ({
      ...group,
      percentage: total > 0 ? Math.round((group.count / total) * 100) : 0,
    }));
  }

  private groupPaymentsByProduct(payments: Payment[]): Array<{
    product: string;
    revenue: number;
    transactions: number;
    avgValue: number;
  }> {
    const products = ['Line Ads', 'Poster Ads', 'Video Ads'];
    const result: Array<{
      product: string;
      revenue: number;
      transactions: number;
      avgValue: number;
    }> = [];

    products.forEach((product) => {
      let productPayments: Payment[] = [];

      switch (product) {
        case 'Line Ads':
          productPayments = payments.filter((p) => p.lineAd);
          break;
        case 'Poster Ads':
          productPayments = payments.filter((p) => p.posterAd);
          break;
        case 'Video Ads':
          productPayments = payments.filter((p) => p.videoAd);
          break;
      }

      const revenue = productPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const transactions = productPayments.length;

      result.push({
        product,
        revenue,
        transactions,
        avgValue: transactions > 0 ? revenue / transactions : 0,
      });
    });

    return result;
  }

  private async groupPaymentsByCategory(payments: Payment[]): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      transactions: number;
    }>
  > {
    const categories = await this.mainCategoryRepository.find();
    const result: Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      transactions: number;
    }> = [];

    for (const category of categories) {
      const categoryPayments = payments.filter((payment) => {
        const ad = payment.lineAd || payment.posterAd || payment.videoAd;
        return ad?.mainCategory?.id === category.id;
      });

      const revenue = categoryPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        revenue,
        transactions: categoryPayments.length,
      });
    }

    return result;
  }

  private groupPaymentsByPeriod(payments: Payment[], period: string): any[] {
    const grouped = new Map();

    payments.forEach((payment) => {
      const date = new Date(payment.created_at);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          period: key,
          revenue: 0,
          transactions: 0,
        });
      }

      const group = grouped.get(key);
      group.revenue += Number(payment.amount);
      group.transactions++;
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    );
  }

  private calculateAvgTimeToAction(comments: AdComment[]): number {
    return 24; // hours (placeholder)
  }

  private calculateAvgApprovalTime(ads: any[]): number {
    const approvedAds = ads.filter((ad) => ad.status === AdStatus.PUBLISHED);
    if (approvedAds.length === 0) return 0;

    let totalTime = 0;
    let validCount = 0;

    approvedAds.forEach((ad) => {
      if (ad.comments && ad.comments.length > 0) {
        const approvalComment = ad.comments.find(
          (c) => c.actionType === AdStatus.PUBLISHED,
        );
        if (approvalComment) {
          const timeDiff =
            new Date(approvalComment.actionTimestamp).getTime() -
            new Date(ad.created_at).getTime();
          totalTime += timeDiff / (1000 * 60 * 60); // Convert to hours
          validCount++;
        }
      }
    });

    return validCount > 0 ? totalTime / validCount : 0;
  }

  private calculateApprovalMetrics(ads: any[]): any {
    const approvalTimes = ads
      .filter(
        (ad) => ad.status === AdStatus.PUBLISHED && ad.comments?.length > 0,
      )
      .map((ad) => {
        const approvalComment = ad.comments.find(
          (c) => c.actionType === AdStatus.PUBLISHED,
        );
        if (approvalComment) {
          return (
            (new Date(approvalComment.actionTimestamp).getTime() -
              new Date(ad.created_at).getTime()) /
            (1000 * 60 * 60)
          );
        }
        return 0;
      })
      .filter((time) => time > 0);

    if (approvalTimes.length === 0) {
      return { avgTimeToApprove: 0, fastestApproval: 0, slowestApproval: 0 };
    }

    return {
      avgTimeToApprove:
        approvalTimes.reduce((sum, time) => sum + time, 0) /
        approvalTimes.length,
      fastestApproval: Math.min(...approvalTimes),
      slowestApproval: Math.max(...approvalTimes),
    };
  }

  private determineUserType(customer: Customer): string {
    if (!customer) return 'Unknown';

    return 'Individual';
  }

  private getDaysDifference(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
