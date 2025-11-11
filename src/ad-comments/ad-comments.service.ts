import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AdComment } from './entities/ad-comment.entity';
import { CreateAdCommentDto } from './dto/create-ad-comment.dto';
import { UpdateAdCommentDto } from './dto/update-ad-comment.dto';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { User } from 'src/user/entities/user.entity';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { UserService } from 'src/user/user.service';
import { LineAdService } from 'src/line-ad/line-ad.service';
import { PosterAdService } from 'src/poster-ad/poster-ad.service';
import { AdType } from 'src/common/enums/ad-type';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAdService } from 'src/video-ad/video-ad.service';

@Injectable()
export class AdCommentService {
  constructor(
    @InjectRepository(AdComment)
    private commentRepo: Repository<AdComment>,
    private userService: UserService,
    private lineAdService: LineAdService,
    private posterAdService: PosterAdService,
    private videoAdService: VideoAdService,
  ) {}

  async create(
    dto: CreateAdCommentDto,
    userId: string,
    adType: AdType,
  ): Promise<AdComment> {
    const user = await this.userService.findOneById(userId);
    let ad;
    let existing;
    let comment;

    if (adType === AdType.LINE) {
      if (!dto.lineAdId) {
        throw new ForbiddenException('Missing lineAdId for LINE ad type');
      }
      ad = await this.lineAdService.findOne(dto.lineAdId);
      existing = await this.findAllForAd(dto.lineAdId, dto.actionType, adType);
      if (ad.status === AdStatus.PAUSED) {
        comment = this.commentRepo.create({
          actionType: dto.actionType,
          comment: dto.comment,
          user,
          lineAd: { id: dto.lineAdId },
        });
        await this.lineAdService.updateAdStatus(dto.lineAdId, dto.actionType);
        return this.commentRepo.save(comment);
      }
      if (existing.length > 0) {
        throw new ForbiddenException('You have already commented on this ad');
      }
      if (ad.status === dto.actionType) {
        throw new ForbiddenException(
          `Ad is already on ${dto.actionType} status`,
        );
      }
      comment = this.commentRepo.create({
        actionType: dto.actionType,
        comment: dto.comment,
        user,
        lineAd: { id: dto.lineAdId },
      });
      await this.lineAdService.updateAdStatus(dto.lineAdId, dto.actionType);
    } else if (adType === AdType.POSTER) {
      if (!dto.posterAdId) {
        throw new ForbiddenException('Missing posterAdId for POSTER ad type');
      }
      ad = await this.posterAdService.findOne(dto.posterAdId);
      existing = await this.findAllForAd(
        dto.posterAdId,
        dto.actionType,
        adType,
      );
      if (ad.status === AdStatus.PAUSED) {
        comment = this.commentRepo.create({
          actionType: dto.actionType,
          comment: dto.comment,
          user,
          posterAd: { id: dto.posterAdId },
        });
        await this.posterAdService.updateAdStatus(
          dto.posterAdId,
          dto.actionType,
        );
        return this.commentRepo.save(comment);
      }
      if (existing.length > 0) {
        throw new ForbiddenException('You have already commented on this ad');
      }
      if (ad.status === dto.actionType) {
        throw new ForbiddenException(
          `Ad is already on ${dto.actionType} status`,
        );
      }
      comment = this.commentRepo.create({
        actionType: dto.actionType,
        comment: dto.comment,
        user,
        posterAd: { id: dto.posterAdId },
      });
      await this.posterAdService.updateAdStatus(dto.posterAdId, dto.actionType);
    } else if (adType === AdType.VIDEO) {
      if (!dto.videoAdId) {
        throw new ForbiddenException('Missing videoAdId for VIDEO ad type');
      }
      ad = await this.videoAdService.findOne(dto.videoAdId);
      existing = await this.findAllForAd(dto.videoAdId, dto.actionType, adType);
      if (ad.status === AdStatus.PAUSED) {
        comment = this.commentRepo.create({
          actionType: dto.actionType,
          comment: dto.comment,
          user,
          videoAd: { id: dto.videoAdId },
        });
        await this.videoAdService.updateAdStatus(dto.videoAdId, dto.actionType);
        return this.commentRepo.save(comment);
      }
      if (existing.length > 0) {
        throw new ForbiddenException('You have already commented on this ad');
      }
      if (ad.status === dto.actionType) {
        throw new ForbiddenException(
          `Ad is already on ${dto.actionType} status`,
        );
      }
      comment = this.commentRepo.create({
        actionType: dto.actionType,
        comment: dto.comment,
        user,
        videoAd: { id: dto.videoAdId },
      });
      await this.videoAdService.updateAdStatus(dto.videoAdId, dto.actionType);
    } else {
      throw new ForbiddenException('Invalid ad type');
    }
    return this.commentRepo.save(comment);
  }

  async findAllForAd(
    adId: string,
    actionType?: AdStatus,
    adType?: AdType,
    isActive: boolean = true,
  ): Promise<AdComment[]> {
    console.log('adId', adId);
    const where: FindOptionsWhere<AdComment> = {};
    if (isActive) {
      where.isActive = true;
    }
    const relations = ['user'];
    if (adType === AdType.LINE) {
      where.lineAd = { id: adId };
      relations.push('lineAd');
    } else if (adType === AdType.POSTER) {
      where.posterAd = { id: adId };
      relations.push('posterAd');
    } else if (adType === AdType.VIDEO) {
      where.videoAd = { id: adId };
      relations.push('videoAd');
      console.log('where', where);
    } else {
      throw new ForbiddenException('Invalid ad type');
    }
    if (actionType) where.actionType = actionType;
    return await this.commentRepo.find({
      where,
      relations: ['user'],
      order: { actionTimestamp: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AdComment> {
    const comment = await this.commentRepo.findOneBy({ id });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, dto: UpdateAdCommentDto): Promise<AdComment> {
    const comment = await this.findOne(id);
    Object.assign(comment, dto);
    return this.commentRepo.save(comment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    comment.isActive = false;
    await this.commentRepo.save(comment);
  }

  async sendForReview(id: string, type: AdType) {
    let ad;
    switch (type) {
      case AdType.LINE:
        ad = await this.lineAdService.findOne(id);
        break;
      case AdType.POSTER:
        ad = await this.posterAdService.findOne(id);
        break;
      case AdType.VIDEO:
        ad = await this.videoAdService.findOne(id);
        break;
    }

    if (ad?.status !== AdStatus.HOLD) {
      throw new ForbiddenException('Ad cannot be sent for review');
    }

    const comments = await this.findAllForAd(id, undefined, type);

    await Promise.all(
      comments.map(async (comment) => {
        await this.remove(comment.id);
      }),
    );

    switch (type) {
      case AdType.LINE:
        await this.lineAdService.updateAdStatus(id, AdStatus.FOR_REVIEW);
        break;
      case AdType.POSTER:
        await this.posterAdService.updateAdStatus(id, AdStatus.FOR_REVIEW);
        break;
      case AdType.VIDEO:
        await this.videoAdService.updateAdStatus(id, AdStatus.FOR_REVIEW);
        break;
    }
  }
}
