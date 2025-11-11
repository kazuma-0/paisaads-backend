import { Entity, Column, ManyToOne } from 'typeorm';
import { CategoryTwo } from './category-two.entity';
import { BaseEntity } from 'src/common/types/base-entity';

@Entity()
export class CategoryThree extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  category_heading_font_color: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => CategoryTwo, (catTwo) => catTwo.subCategories, {
    onDelete: 'CASCADE',
  })
  parent: CategoryTwo;
}
