import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { VideoAdService } from './video-ad.service';
import { CreateVideoAdDto } from './dto/create-video-ad.dto';
import { UpdateVideoAdDto } from './dto/update-video-ad.dto';
import { PageType } from 'src/common/enums/page-type.enum';

@ApiTags('Video Ads')
@ApiBearerAuth()
@Controller('video-ad')
export class VideoAdController {
  constructor(private readonly videoAdService: VideoAdService) {}

  @Get('today')
  @Public()
  async getVideoAdsToday(
    @Query('categoryId') categoryId?: string,
    @Query('stateId') stateId?: number,
    @Query('cityId') cityId?: number,
  ) {
    return await this.videoAdService.getTodayVideoAds({
      categoryId,
      stateId,
      cityId,
      pageType: PageType.HOME,
    });
  }
  @Post()
  @Roles(Role.USER)
  async create(
    @CurrentUser() user,
    @Body() createVideoAdDto: CreateVideoAdDto,
  ) {
    return await this.videoAdService.createAd(user.sub, createVideoAdDto);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'status', enum: AdStatus, required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('stateId') stateId?: number,
    @Query('cityId') cityId?: number,
  ) {
    return this.videoAdService.findAll({
      categoryId,
      cityId,
      stateId,
    });
  }

  @Get('status/:statuses')
  @Roles(Role.EDITOR, Role.REVIEWER, Role.SUPER_ADMIN)
  findByStatuses(@Param('statuses') statuses: string) {
    const statusArray = statuses
      .split(',')
      .map((status) => status.trim()) as AdStatus[];
    return this.videoAdService.findAllByStatuses(statusArray);
  }

  @Get('my-ads')
  @Roles(Role.USER)
  findMyAds(@CurrentUser() user) {
    return this.videoAdService.findAllByUserId(user.sub);
  }

  @Get('category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.videoAdService.findByCategory(categoryId);
  }

  @Get('search')
  @Public()
  search(
    @Query('text') text?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: AdStatus,
  ) {
    return this.videoAdService.searchAds({
      text,
      city,
      state,
      categoryId,
      status,
    });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.videoAdService.findOne(id);
  }

  @Patch('admin/:id')
  @Roles(Role.EDITOR, Role.SUPER_ADMIN, Role.REVIEWER)
  async updateByAdmins(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateVideoAdDto: UpdateVideoAdDto,
  ) {
    return this.videoAdService.updateAdByAdmin(user.sub, id, updateVideoAdDto);
  }

  @Patch(':id')
  @Roles(Role.USER)
  async update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateVideoAdDto: UpdateVideoAdDto,
  ) {
    return this.videoAdService.updateAdByAdmin(user.sub, id, updateVideoAdDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.SUPER_ADMIN)
  async remove(@CurrentUser() user, @Param('id') id: string) {
    const ad = await this.videoAdService.findOne(id);
    if (user.role !== Role.SUPER_ADMIN && ad.customer.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own ads');
    }
    return this.videoAdService.deleteAdByUser(user.sub, id);
  }
}
