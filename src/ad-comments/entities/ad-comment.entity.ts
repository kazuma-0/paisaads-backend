import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/types/base-entity';
import { User } from 'src/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';

@Entity()
export class AdComment extends BaseEntity {
  @Column({
    type: 'enum',
    enum: AdStatus,
    nullable: false,
  })
  @ApiProperty({
    enum: AdStatus,
    description: 'Type of action performed',
  })
  actionType: AdStatus;

  @Column({ nullable: false, type: 'text' })
  @ApiProperty({ required: false })
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Timestamp of when the action was performed' })
  actionTimestamp: Date;

  @ManyToOne(() => LineAd, (lineAd) => lineAd.comments)
  lineAd: LineAd;

  @ManyToOne(() => PosterAd, (posterAd) => posterAd.comments)
  posterAd: PosterAd;

  @ManyToOne(() => VideoAd, (videoAd) => videoAd.comments)
  videoAd: VideoAd;

  @ManyToOne(() => User, { nullable: false })
  @ApiProperty({
    type: () => User,
    description: 'User who performed the action',
  })
  user: User;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;
}
