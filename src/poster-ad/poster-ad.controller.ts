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
import { PosterAdService } from './poster-ad.service';
import { CreatePosterAdDto } from './dto/create-poster-ad.dto';
import { UpdatePosterAdDto } from './dto/update-poster-ad.dto';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';
import { AdStatus } from 'src/common/enums/ad-status.enum';

@ApiTags('Poster Ads')
@ApiBearerAuth()
@Controller('poster-ad')
export class PosterAdController {
  constructor(private readonly posterAdService: PosterAdService) {}

  @Get('today')
  @Public()
  async getPosterAdsToday(
    @Query('categoryId') categoryId?: string,
    @Query('stateId') stateId?: number,
    @Query('cityId') cityId?: number,
  ) {
    return await this.posterAdService.getTodayPosterAds({
      categoryId,
      stateId,
      cityId,
    });
  }
  @Post()
  @Roles(Role.USER)
  async create(
    @CurrentUser() user,
    @Body() createPosterAdDto: CreatePosterAdDto,
  ) {
    return await this.posterAdService.createAd(user.sub, createPosterAdDto);
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
    return this.posterAdService.findAll({
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
    return this.posterAdService.findAllByStatuses(statusArray);
  }

  @Get('my-ads')
  @Roles(Role.USER)
  findMyAds(@CurrentUser() user) {
    return this.posterAdService.findAllByUserId(user.sub);
  }

  @Get('category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.posterAdService.findByCategory(categoryId);
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
    return this.posterAdService.searchAds({
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
    return this.posterAdService.findOne(id);
  }

  @Patch('admin/:id')
  @Roles(Role.EDITOR, Role.SUPER_ADMIN, Role.REVIEWER)
  async updateByAdmins(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updatePosterAdDto: UpdatePosterAdDto,
  ) {
    return this.posterAdService.updateAdByAdmin(
      user.sub,
      id,
      updatePosterAdDto,
    );
  }

  @Patch(':id')
  @Roles(Role.USER)
  async update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updatePosterAdDto: UpdatePosterAdDto,
  ) {
    return this.posterAdService.updateAdByUser(user.sub, id, updatePosterAdDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.SUPER_ADMIN)
  async remove(@CurrentUser() user, @Param('id') id: string) {
    const ad = await this.posterAdService.findOne(id);
    if (user.role !== Role.SUPER_ADMIN && ad.customer.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own ads');
    }
    return this.posterAdService.deleteAdByAdmin(id, user.sub);
  }
}
