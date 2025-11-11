import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateAdCommentDto } from './dto/create-ad-comment.dto';
import { UpdateAdCommentDto } from './dto/update-ad-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { AdCommentService } from './ad-comments.service';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AdType } from 'src/common/enums/ad-type';

@ApiTags('Ad Comments')
@ApiBearerAuth()
@Controller('ad-comments')
export class AdCommentController {
  constructor(private readonly adCommentService: AdCommentService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  create(@CurrentUser() user, @Body() dto: CreateAdCommentDto) {
    return this.adCommentService.create(dto, user.sub, dto.adType);
  }

  @Get('ad/:adType/:adId')
  findAllForAd(
    @Param('adType') adType: AdType,
    @Param('adId') id: string,
    @Query('actionType') actionType?: AdStatus,
    @Query('history') history?: boolean,
  ) {
    let adId: string | undefined = undefined;
    if (adType === AdType.LINE) adId = id;
    else if (adType === AdType.POSTER) adId = id;
    else if (adType === AdType.VIDEO) adId = id;
    return this.adCommentService.findAllForAd(
      adId as string,
      actionType,
      adType,
      !history,
    );
  }

  @Post('send-for-review/:adType/:adId')
  sendForReview(@Param('adType') adType: AdType, @Param('adId') adId: string) {
    return this.adCommentService.sendForReview(adId, adType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adCommentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdCommentDto) {
    return this.adCommentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adCommentService.remove(id);
  }
}
