import { AdType } from 'src/common/enums/ad-type';
import { PageType } from 'src/common/enums/page-type.enum';
import { PositionType } from 'src/common/enums/position-type.enum';
import { BaseEntity } from 'src/common/types/base-entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('ad_positions')
export class AdPosition extends BaseEntity {
  @OneToOne(() => VideoAd, (videoAd) => videoAd.position)
  videoAd: VideoAd;

  @OneToOne(() => PosterAd, (posterAd) => posterAd.position)
  posterAd: PosterAd;

  @OneToOne(() => LineAd, (lineAd) => lineAd.position)
  lineAd: LineAd;

  @Column({ type: 'enum', enum: AdType })
  adType: AdType;

  @Column({ type: 'enum', enum: PageType, default: PageType.HOME })
  pageType: PageType;

  @Column({ type: 'enum', enum: PositionType, nullable: true })
  side: PositionType; // only for video and poster ads

  @Column({ type: 'int', default: 0, nullable: true })
  position: number; // 1 to 6
}
