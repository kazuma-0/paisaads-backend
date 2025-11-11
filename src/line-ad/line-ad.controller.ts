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
import { LineAdService } from './line-ad.service';
import { CreateLineAdDto } from './dto/create-line-ad.dto';
import { UpdateLineAdDto } from './dto/update-line-ad.dto';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';
import { AdStatus } from 'src/common/enums/ad-status.enum';

@ApiTags('Line Ads')
@ApiBearerAuth()
@Controller('line-ad')
export class LineAdController {
  constructor(private readonly lineAdService: LineAdService) {}

  @Post()
  @Roles(Role.USER)
  async create(@CurrentUser() user, @Body() createLineAdDto: CreateLineAdDto) {
    return await this.lineAdService.createAd(user.sub, createLineAdDto);
  }

  @Get('today')
  @Public()
  async getLineAdToday(
    @Query('categoryId') categoryId?: string,
    @Query('stateId') stateId?: number,
    @Query('cityId') cityId?: number,
  ) {
    return await this.lineAdService.getTodayLineAds({
      categoryId,
      stateId,
      cityId,
    });
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
    return this.lineAdService.findAll({
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
    return this.lineAdService.findAllByStatuses(statusArray);
  }

  @Get('my-ads')
  @Roles(Role.USER)
  findMyAds(@CurrentUser() user) {
    return this.lineAdService.findAllByUserId(user.sub);
  }

  @Get('category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.lineAdService.findByCategory(categoryId);
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
    return this.lineAdService.searchAds({
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
    return this.lineAdService.findOne(id);
  }
  @Patch('admin/:id')
  @Roles(Role.EDITOR, Role.SUPER_ADMIN, Role.REVIEWER)
  async updateByAdmins(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateLineAdDto: UpdateLineAdDto,
  ) {
    return this.lineAdService.updateAdByAdmin(user.sub, id, updateLineAdDto);
  }
  @Patch(':id')
  @Roles(Role.USER)
  async update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateLineAdDto: UpdateLineAdDto,
  ) {
    return this.lineAdService.updateAdByUser(user.sub, id, updateLineAdDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.SUPER_ADMIN)
  async remove(@CurrentUser() user, @Param('id') id: string) {
    const ad = await this.lineAdService.findOne(id);
    if (user.role !== Role.SUPER_ADMIN && ad.customer.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own ads');
    }
    return this.lineAdService.deleteAdByAdmin(id, user.sub);
  }
}
