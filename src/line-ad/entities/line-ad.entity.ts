import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/types/base-entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { Image } from 'src/image/entities/image.entity';
import { CategoryOne } from 'src/category/entities/category-one.entity';
import { CategoryThree } from 'src/category/entities/category-three.entity';
import { CategoryTwo } from 'src/category/entities/category-two.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';
import { AdComment } from 'src/ad-comments/entities/ad-comment.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { AdPosition } from 'src/ad-position/entities/ad-position.entity';
@Entity()
export class LineAd extends BaseEntity {
  @Generated('increment')
  @Column()
  sequenceNumber: number;

  @Column({ nullable: true }) // Order ID can be derived from sequenceNumber + date etc in future
  orderId: number;

  @ManyToOne(() => MainCategory, { eager: true, nullable: false })
  mainCategory: MainCategory;

  @ManyToOne(() => CategoryOne, { eager: true, nullable: true })
  categoryOne?: CategoryOne;

  @ManyToOne(() => CategoryTwo, { eager: true, nullable: true })
  categoryTwo?: CategoryTwo;

  @ManyToOne(() => CategoryThree, { eager: true, nullable: true })
  categoryThree?: CategoryThree;

  @Column()
  content: string;

  @OneToMany(() => Image, (image) => image.lineAd, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  images: Image[];

  @Column()
  state: string;

  @Column({ nullable: true })
  sid: number;

  @Column()
  city: string;

  @Column({ nullable: true })
  cid: number;

  @Column('simple-array')
  dates: string[];

  @Column()
  postedBy: string;

  @Column({ type: 'bigint' })
  contactOne: number;

  @Column({ nullable: true, type: 'bigint' })
  contactTwo: number;

  @Column({ nullable: true })
  backgroundColor: string;

  @Column({ nullable: true })
  textColor: string;

  @OneToOne(() => Payment, (payment) => payment.lineAd, {
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

  @OneToMany(() => AdComment, (comment) => comment.lineAd, {})
  comments: AdComment[];

  @ManyToOne(() => Customer, (customer) => customer.lineAds, {
    nullable: false,
  })
  @JoinColumn() // optional, helps clarity
  customer: Customer;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => AdPosition, (position) => position.lineAd)
  @JoinColumn()
  position: AdPosition;
}
