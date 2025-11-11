import { BaseEntity } from 'src/common/types/base-entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ default: true })
  isTemp: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_on: Date;

  @ManyToOne(() => LineAd)
  lineAd: LineAd;

  @OneToOne(() => PosterAd)
  posterAd: PosterAd;

  @OneToOne(() => VideoAd)
  videoAd: VideoAd;

  @ManyToOne(() => Customer, (customer) => customer.proof) // (customer) => customer.images
  customer: Customer;

  @OneToOne(() => Payment, (payment) => payment.proof)
  payment_proof: Payment;
}
