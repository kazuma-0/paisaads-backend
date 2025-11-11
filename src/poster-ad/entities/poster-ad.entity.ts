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
export class PosterAd extends BaseEntity {
  @Generated('increment')
  @Column()
  @ApiProperty({ description: 'Sequence number for order generation' })
  sequenceNumber: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Order tracking number', required: false })
  orderId: number;



  @ManyToOne(() => Customer, (customer) => customer.posterAds, {
    nullable: false,
  })
  @ApiProperty({ type: () => Customer, description: 'User who created the ad' })
  @JoinColumn()
  customer: Customer;


  @ManyToOne(() => MainCategory, { eager: true, nullable: false })
  @ApiProperty({ description: 'Main category of the ad' })
  mainCategory: MainCategory;

  @ManyToOne(() => CategoryOne, { eager: true, nullable: true })
  @ApiProperty({ description: 'First subcategory', required: false })
  categoryOne?: CategoryOne;

  @ManyToOne(() => CategoryTwo, { eager: true, nullable: true })
  @ApiProperty({ description: 'Second subcategory', required: false })
  categoryTwo?: CategoryTwo;

  @ManyToOne(() => CategoryThree, { eager: true, nullable: true })
  @ApiProperty({ description: 'Third subcategory', required: false })
  categoryThree?: CategoryThree;

  @OneToOne(() => Image, { cascade: true, eager: true, nullable: false })
  @JoinColumn()
  @ApiProperty({
    type: Image,
    description: 'Image attached to this ad',
    required: true,
  })
  image: Image;

  @OneToOne(() => Payment, (payment) => payment.posterAd, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  @ApiProperty({ type: () => Payment, required: false })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: AdStatus,
    default: AdStatus.DRAFT,
  })
  @ApiProperty({
    enum: AdStatus,
    default: AdStatus.DRAFT,
    description: 'Current status of the ad',
  })
  status: AdStatus;

  @OneToMany(() => AdComment, (comment) => comment.posterAd, {})
  @ApiProperty({
    type: () => [AdComment],
    description: 'Comments and timestamps for this ad',
    required: false,
  })
  comments: AdComment[];

  @Column({ default: true })
  @ApiProperty()
  isActive: boolean;

  @Column('simple-array')
  @ApiProperty({ type: [String], description: 'Active dates for this ad' })
  dates: string[];

  @Column()
  @ApiProperty()
  state: string;

  @Column({ nullable: true })
  @ApiProperty()
  sid: number;

  @Column()
  @ApiProperty()
  city: string;

  @Column({ nullable: true })
  @ApiProperty()
  cid: number;

  @Column()
  @ApiProperty()
  postedBy: string;

  @OneToOne(() => AdPosition, (position) => position.posterAd)
  @JoinColumn()
  position: AdPosition;
}
