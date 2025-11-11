import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/types/base-entity';
import { Customer } from 'src/user/entities/customer.entity';
import { Image } from 'src/image/entities/image.entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';

@Entity()
export class Payment extends BaseEntity {
  @Column()
  method: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ nullable: false })
  details: string;

  @ManyToOne(() => Customer, { nullable: false })
  customer: Customer;

  @OneToOne(() => Image, (image) => image.payment_proof, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  proof: Image;

  @OneToOne(() => LineAd, (lineAd) => lineAd.payment)
  lineAd: LineAd;

  @OneToOne(() => PosterAd, (posterAd) => posterAd.payment)
  posterAd: PosterAd;

  @OneToOne(() => VideoAd, (videoAd) => videoAd.payment)
  videoAd: VideoAd;
}
