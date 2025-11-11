import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { GENDER } from 'src/common/enums/gender.enum';
import { BaseEntity } from 'src/common/types/base-entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Image } from 'src/image/entities/image.entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';

@Entity()
export class Customer extends BaseEntity {
  @Column()
  country: string;

  @Column()
  country_id: string;

  @Column()
  state: string;

  @Column()
  state_id: string;

  @Column()
  city: string;

  @Column()
  city_id: string;

  @OneToOne(() => Image, (image) => image.customer, {
    eager: true,
    cascade: true,
    nullable:true,
  })
  @JoinColumn()
  proof: Image;

  @Column({ type: 'enum', enum: GENDER })
  gender: GENDER;

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments: Payment[];

  @OneToOne(() => User, (user) => user.customer)
  @JoinColumn()
  user: User;

  @OneToMany(() => LineAd, (lineAd) => lineAd.customer)
  lineAds: LineAd[];

  @OneToMany(() => PosterAd, (posterAd) => posterAd.customer)
  posterAds: PosterAd[];

  @OneToMany(() => VideoAd, (videoAd) => videoAd.customer)
  videoAds: VideoAd[];
}
