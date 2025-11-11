import { ApiProperty } from '@nestjs/swagger';
import { CategoryOne } from 'src/category/entities/category-one.entity';
import { CategoryThree } from 'src/category/entities/category-three.entity';
import { CategoryTwo } from 'src/category/entities/category-two.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';
import { BaseEntity } from 'src/common/types/base-entity';
import {
  Generated,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Entity,
} from 'typeorm';
import { Image } from 'src/image/entities/image.entity';
import { AdComment } from 'src/ad-comments/entities/ad-comment.entity';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { AdPosition } from 'src/ad-position/entities/ad-position.entity';

@Entity()
export class VideoAd extends BaseEntity {
  @Generated('increment')
  @Column()
  sequenceNumber: number;

  @Column({ nullable: true }) // Order ID can be derived from sequenceNumber + date etc in future
  orderId: number;

  @ManyToOne(() => Customer, (customer) => customer.videoAds, {
    nullable: false,
  })
  @JoinColumn() // optional, helps clarity
  customer: Customer;

  @ManyToOne(() => MainCategory, { eager: true, nullable: false })
  mainCategory: MainCategory;

  @ManyToOne(() => CategoryOne, { eager: true, nullable: true })
  categoryOne?: CategoryOne;

  @ManyToOne(() => CategoryTwo, { eager: true, nullable: true })
  categoryTwo?: CategoryTwo;

  @ManyToOne(() => CategoryThree, { eager: true, nullable: true })
  categoryThree?: CategoryThree;

  @OneToOne(() => Image, { cascade: true, eager: true, nullable: false })
  @JoinColumn()
  image: Image;

  @OneToOne(() => Payment, (payment) => payment.videoAd, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  payment: Payment;

  @Column({
    type: 'enum',
    enum: AdStatus,
    default: AdStatus.DRAFT,
  })
  status: AdStatus;

  @OneToMany(() => AdComment, (comment) => comment.videoAd, {})
  comments: AdComment[];

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array')
  dates: string[];

  @Column()
  state: string;

  @Column({ nullable: true })
  sid: number;

  @Column()
  city: string;

  @Column({ nullable: true })
  cid: number;

  @Column()
  postedBy: string;

  @OneToOne(() => AdPosition, (position) => position.videoAd)
  @JoinColumn()
  position: AdPosition;
}
