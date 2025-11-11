import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/category/category.service';
import { AdCommentService } from 'src/ad-comments/ad-comments.service';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { ImageService } from 'src/image/image.service';
import {
  Between,
  FindOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { CreateLineAdDto } from './dto/create-line-ad.dto';
import { LineAd } from './entities/line-ad.entity';
import { UserService } from 'src/user/user.service';
import { AdPositionService } from 'src/ad-position/ad-position.service';
import { AdType } from 'src/common/enums/ad-type';

@Injectable()
export class LineAdService {
  constructor(
    @InjectRepository(LineAd) private lineAdRepo: Repository<LineAd>,
    private readonly categoryService: CategoriesService,
    private readonly imageService: ImageService,
    private readonly userService: UserService,
    private readonly adPositionService: AdPositionService,
  ) {}

  async createAd(
    userId: string,
    createAdDto: CreateLineAdDto,
  ): Promise<LineAd> {
    const user = await this.userService.findOneById(userId);
    if (!user.customer) {
      throw new NotFoundException('User not found');
    }

    const {
      mainCategoryId,
      categoryOneId,
      categoryTwoId,
      categoryThreeId,
      imageIds,
      pageType,
      ...ad
    } = createAdDto;

    const adPosition = await this.adPositionService.create({
      adType: AdType.LINE,
      pageType,
      side: undefined,
      position: 0, // Using 0 as a placeholder for null
    });

    const advert = this.lineAdRepo.create(ad);
    advert.position = adPosition;
    advert.customer = user.customer;
    const mainCategory =
      await this.categoryService.findMainCategoryById(mainCategoryId);
    if (!mainCategory) {
      throw new NotFoundException('Main category not found');
    }

    advert.mainCategory = mainCategory;

    if (categoryOneId) {
      const categoryOne =
        await this.categoryService.findCategoryOneById(categoryOneId);
      if (!categoryOne) {
        throw new NotFoundException('Category one not found');
      }
      advert.categoryOne = categoryOne;
    }

    if (categoryTwoId) {
      const categoryTwo =
        await this.categoryService.findCategoryTwoById(categoryTwoId);
      if (!categoryTwo) {
        throw new NotFoundException('Category two not found');
      }
      advert.categoryTwo = categoryTwo;
    }

    if (categoryThreeId) {
      const categoryThree =
        await this.categoryService.findCategoryThreeById(categoryThreeId);
      if (!categoryThree) {
        throw new NotFoundException('Category three not found');
      }
      advert.categoryThree = categoryThree;
    }
    if (imageIds) {
      const savedImages = Promise.all(
        imageIds.map(async (imageId) => {
          const image = await this.imageService.confirmImage(imageId);
          return image;
        }),
      );

      advert.images = await savedImages;
    }

    return await this.lineAdRepo.save(advert);
  }

  async getTodayLineAds({
    categoryId,
    cityId,
    stateId,
  }: {
    categoryId?: string;
    cityId?: number;
    stateId?: number;
  }) {
    const today = new Date();
    const todayISOString =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    const where: FindOptionsWhere<LineAd> = {
      status: AdStatus.PUBLISHED,
      isActive: true,
    };

    if (categoryId) {
      where.mainCategory = { id: categoryId };
    }
    if (cityId) {
      where.cid = cityId;
    }
    if (stateId) {
      where.sid = stateId;
    }

    const lineAds = await this.lineAdRepo.find({
      where,
      relations: [
        'customer',
        'customer.user',
        'images',
        'position',
        'mainCategory',
        'categoryOne',
        'categoryTwo',
        'categoryThree',
      ],
    });

    const filteredAds = lineAds.filter((ad) => {
      if (!Array.isArray(ad.dates) || ad.dates.length === 0) {
        return false;
      }

      return ad.dates.some((dateStr) => {
        try {
          const adDate = new Date(dateStr);
          const adDateString =
            adDate.getFullYear() +
            '-' +
            String(adDate.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(adDate.getDate()).padStart(2, '0');

          return adDateString === todayISOString;
        } catch (error) {
          console.error('Error parsing date:', dateStr, error);
          return false;
        }
      });
    });

    return filteredAds.map((ad) => {
      const {
        payment,
        customer,
        sequenceNumber,
        orderId,
        status,
        comments,
        dates,
        isActive,
        cid,
        sid,
        ...serializedAd
      } = ad;

      return {
        ...serializedAd,

        customerName: customer?.user?.name || null,

        cityId: cid,
        stateId: sid,
      };
    });
  }

  async updateAdByUser(
    userId: string,
    adId: string,
    updateDto: Partial<CreateLineAdDto>,
  ): Promise<LineAd> {
    const user = await this.userService.findOneById(userId);
    const ad = await this.lineAdRepo.findOne({
      where: { id: adId },
      relations: ['customer', 'position'],
    });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.customer.id !== user.customer.id)
      throw new ForbiddenException('You can only edit your own ad');
    if (ad.status === AdStatus.REJECTED)
      throw new BadRequestException('Rejected ads cannot be edited');
    if (![AdStatus.DRAFT, AdStatus.HOLD].includes(ad.status))
      throw new BadRequestException(
        'Ad can only be edited in DRAFT or HOLD status',
      );

    const { pageType } = updateDto as any;

    if (ad.position && pageType) {
      await this.adPositionService.update(ad.position.id, {
        pageType,
        side: undefined,
        position: 0, // Using 0 as a placeholder for null
      });
    }

    Object.assign(ad, updateDto);
    return this.lineAdRepo.save(ad);
  }

  async updateAdByAdmin(
    userId: string,
    adId: string,
    updateDto: Partial<CreateLineAdDto>,
  ): Promise<LineAd> {
    const ad = await this.lineAdRepo.findOne({
      where: { id: adId },
      relations: ['customer', 'images', 'position'],
    });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.status === AdStatus.REJECTED)
      throw new BadRequestException('Rejected ads cannot be edited');

    const {
      mainCategoryId,
      categoryOneId,
      categoryTwoId,
      categoryThreeId,
      imageIds,
      pageType,
      ...adData
    } = updateDto as any;

    if (ad.position && pageType) {
      await this.adPositionService.update(ad.position.id, {
        pageType,
        side: undefined,
        position: 0, // Using 0 as a placeholder for null
      });
    }

    if (mainCategoryId) {
      const mainCategory =
        await this.categoryService.findMainCategoryById(mainCategoryId);
      if (!mainCategory) throw new NotFoundException('Main category not found');
      ad.mainCategory = mainCategory;
    }

    if (categoryOneId) {
      const categoryOne =
        await this.categoryService.findCategoryOneById(categoryOneId);
      if (!categoryOne) throw new NotFoundException('Category one not found');
      ad.categoryOne = categoryOne;
    }

    if (categoryTwoId) {
      const categoryTwo =
        await this.categoryService.findCategoryTwoById(categoryTwoId);
      if (!categoryTwo) throw new NotFoundException('Category two not found');
      ad.categoryTwo = categoryTwo;
    }

    if (categoryThreeId) {
      const categoryThree =
        await this.categoryService.findCategoryThreeById(categoryThreeId);
      if (!categoryThree)
        throw new NotFoundException('Category three not found');
      ad.categoryThree = categoryThree;
    }

    if (imageIds) {
      const savedImages = await Promise.all(
        imageIds.map(async (imageId) => {
          const image = await this.imageService.confirmImage(imageId);
          return image;
        }),
      );
      ad.images = savedImages;
    }

    Object.assign(ad, adData);

    return this.lineAdRepo.save(ad);
  }

  async updateAdStatus(adId: string, status: AdStatus): Promise<LineAd> {
    const ad = await this.lineAdRepo.findOne({
      where: { id: adId },
      relations: ['position'],
    });
    if (!ad) throw new NotFoundException('Ad not found');
    ad.status = status;
    return this.lineAdRepo.save(ad);
  }

  async assignOrderId(adId: string): Promise<LineAd> {
    const ad = await this.lineAdRepo.findOne({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    const lastOrderId = await this.lineAdRepo
      .createQueryBuilder('ad')
      .select('MAX(ad.orderId)', 'maxOrderId')
      .getRawOne();
    const nextOrderId = lastOrderId.maxOrderId + 1;
    ad.orderId = nextOrderId;
    return this.lineAdRepo.save(ad);
  }

  async deleteAdByAdmin(adId: string, userId: string): Promise<LineAd> {
    const ad = await this.lineAdRepo.findOne({
      where: { id: adId },
      relations: ['user', 'position'],
    });

    if (ad?.position) {
      await this.adPositionService.remove(ad.position.id);
    }
    if (!ad) throw new NotFoundException('Ad not found');
    ad.isActive = false;
    return this.lineAdRepo.save(ad);
  }

  async findOne(id: string): Promise<LineAd> {
    const ad = await this.lineAdRepo.findOne({
      where: { id },
      relations: ['customer', 'customer.user', 'position'],
    });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async findAll(filters?: {
    status?: AdStatus;
    userId?: string;
    categoryId?: string;
    cityId?: number;
    stateId?: number;
  }): Promise<LineAd[]> {
    const query = this.lineAdRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.customer', 'customer')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .leftJoinAndSelect('ad.images', 'images')
      .leftJoinAndSelect('ad.comments', 'comments')
      .leftJoinAndSelect('ad.position', 'position')
      .where('ad.isActive = :isActive', { isActive: true });

    if (filters?.status) {
      query.andWhere('ad.status = :status', { status: filters.status });
    }
    if (filters?.userId) {
      query.andWhere('user.id = :userId', { userId: filters.userId });
    }
    if (filters?.categoryId) {
      query.andWhere(
        'mainCategory.id = :catId OR categoryOne.id = :catId OR categoryTwo.id = :catId OR categoryThree.id = :catId',
        { catId: filters.categoryId },
      );
    }
    if (filters?.cityId) {
      query.andWhere('ad.cityId = :cityId', { cityId: filters.cityId });
    }
    if (filters?.stateId) {
      query.andWhere('ad.stateId = :stateId', { stateId: filters.stateId });
    }
    return query.orderBy('ad.created_at', 'DESC').getMany();
  }

  async findAllByStatuses(statuses: AdStatus[]): Promise<LineAd[]> {
    const lineAds = await this.lineAdRepo.find({
      where: {
        status: In(statuses),
      },
      relations: [
        'customer',
        'customer.user',
        'mainCategory',
        'categoryOne',
        'categoryTwo',
        'categoryThree',
        'images',
        'comments',
        'position',
      ],
      order: { created_at: 'DESC' },
    });

    return lineAds;
  }

  async findAllByUserId(userId: string): Promise<LineAd[]> {
    const user = await this.userService.findOneById(userId);
    return await this.lineAdRepo.find({
      where: { customer: { id: user.customer.id } },
      relations: [
        'customer',
        'mainCategory',
        'categoryOne',
        'categoryTwo',
        'categoryThree',
        'images',
        'comments',
        'position',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findAllByStatusAndTimeFrame(
    status: AdStatus,
    page: number = 1,
    limit: number = 15,
    startDate?: Date,
    endDate?: Date,
    filters?: {
      userType?: string;
      userTypes?: string[];
      state?: string;
      stateId?: number;
      city?: string;
      cityId?: number;
      mainCategoryId?: string;
      categoryOneId?: string;
      categoryTwoId?: string;
      categoryThreeId?: string;
      categoryId?: string;
      customerId?: string;
      searchText?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<[LineAd[], number]> {
    const query = this.lineAdRepo
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

    query.andWhere('ad.status = :status', { status });

    if (filters?.isActive !== undefined) {
      query.andWhere('ad.isActive = :isActive', { isActive: filters.isActive });
    } else {
      query.andWhere('ad.isActive = :isActive', { isActive: true });
    }

    if (startDate && endDate) {
      query.andWhere('ad.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('ad.created_at >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('ad.created_at <= :endDate', { endDate });
    }

    if (filters?.userType) {
      query.andWhere('ad.postedBy = :userType', { userType: filters.userType });
    } else if (filters?.userTypes && filters.userTypes.length > 0) {
      query.andWhere('ad.postedBy IN (:...userTypes)', {
        userTypes: filters.userTypes,
      });
    }

    if (filters?.state) {
      query.andWhere('ad.state = :state', { state: filters.state });
    }
    if (filters?.stateId) {
      query.andWhere('ad.sid = :stateId', { stateId: filters.stateId });
    }
    if (filters?.city) {
      query.andWhere('ad.city = :city', { city: filters.city });
    }
    if (filters?.cityId) {
      query.andWhere('ad.cid = :cityId', { cityId: filters.cityId });
    }

    if (filters?.mainCategoryId) {
      query.andWhere('mainCategory.id = :mainCategoryId', {
        mainCategoryId: filters.mainCategoryId,
      });
    }
    if (filters?.categoryOneId) {
      query.andWhere('categoryOne.id = :categoryOneId', {
        categoryOneId: filters.categoryOneId,
      });
    }
    if (filters?.categoryTwoId) {
      query.andWhere('categoryTwo.id = :categoryTwoId', {
        categoryTwoId: filters.categoryTwoId,
      });
    }
    if (filters?.categoryThreeId) {
      query.andWhere('categoryThree.id = :categoryThreeId', {
        categoryThreeId: filters.categoryThreeId,
      });
    }
    if (filters?.categoryId) {
      query.andWhere(
        '(mainCategory.id = :categoryId OR categoryOne.id = :categoryId OR categoryTwo.id = :categoryId OR categoryThree.id = :categoryId)',
        { categoryId: filters.categoryId },
      );
    }

    if (filters?.customerId) {
      query.andWhere('customer.id = :customerId', {
        customerId: filters.customerId,
      });
    }

    if (filters?.searchText) {
      query.andWhere('ad.content LIKE :searchText', {
        searchText: `%${filters.searchText}%`,
      });
    }

    const sortField = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'DESC';
    query.orderBy(`ad.${sortField}`, sortOrder);

    const totalCount = await query.clone().getCount();

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const results = await query.getMany();
    return [results, totalCount];
  }

  async findByCategory(categoryId: string): Promise<LineAd[]> {
    return this.lineAdRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .where(
        'mainCategory.id = :catId OR categoryOne.id = :catId OR categoryTwo.id = :catId OR categoryThree.id = :catId',
        { catId: categoryId },
      )
      .andWhere('ad.isActive = :isActive', { isActive: true })
      .orderBy('ad.created_at', 'DESC')
      .getMany();
  }

  async searchAds(params: {
    text?: string;
    city?: string;
    state?: string;
    categoryId?: string;
    status?: AdStatus;
  }): Promise<LineAd[]> {
    const query = this.lineAdRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.user', 'user')
      .leftJoinAndSelect('ad.mainCategory', 'mainCategory')
      .leftJoinAndSelect('ad.categoryOne', 'categoryOne')
      .leftJoinAndSelect('ad.categoryTwo', 'categoryTwo')
      .leftJoinAndSelect('ad.categoryThree', 'categoryThree')
      .leftJoinAndSelect('ad.images', 'images')
      .leftJoinAndSelect('ad.comments', 'comments')
      .leftJoinAndSelect('ad.position', 'position')
      .where('ad.isActive = :isActive', { isActive: true });

    if (params.text) {
      query.andWhere('ad.content LIKE :text', { text: `%${params.text}%` });
    }
    if (params.city) {
      query.andWhere('ad.city = :city', { city: params.city });
    }
    if (params.state) {
      query.andWhere('ad.state = :state', { state: params.state });
    }
    if (params.categoryId) {
      query.andWhere(
        'mainCategory.id = :catId OR categoryOne.id = :catId OR categoryTwo.id = :catId OR categoryThree.id = :catId',
        { catId: params.categoryId },
      );
    }
    if (params.status) {
      query.andWhere('ad.status = :status', { status: params.status });
    }
    return query.orderBy('ad.created_at', 'DESC').getMany();
  }

  async getLineAdStats() {
    const total = await this.lineAdRepo.count({ where: { isActive: true } });

    const statusCounts = {} as Record<string, number>;
    for (const status of Object.values(AdStatus)) {
      statusCounts[status] = await this.lineAdRepo.count({
        where: { status, isActive: true },
      });
    }

    const cityRows = await this.lineAdRepo
      .createQueryBuilder('ad')
      .select('ad.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('ad.isActive = :isActive', { isActive: true })
      .groupBy('ad.city')
      .getRawMany();

    const stateRows = await this.lineAdRepo
      .createQueryBuilder('ad')
      .select('ad.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .where('ad.isActive = :isActive', { isActive: true })
      .groupBy('ad.state')
      .getRawMany();

    const categoryRows = await this.lineAdRepo
      .createQueryBuilder('ad')
      .leftJoin('ad.mainCategory', 'mainCategory')
      .select('mainCategory.name', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('ad.isActive = :isActive', { isActive: true })
      .groupBy('mainCategory.name')
      .getRawMany();
    return {
      total,
      statusCounts,
      byCity: cityRows,
      byState: stateRows,
      byMainCategory: categoryRows,
    };
  }
}
