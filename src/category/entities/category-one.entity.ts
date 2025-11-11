import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { MainCategory } from './main-category.entity';
import { CategoryTwo } from './category-two.entity';
import { BaseEntity } from 'src/common/types/base-entity';

@Entity()
export class CategoryOne extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  category_heading_font_color: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => MainCategory, (mc) => mc.subCategories, {
    onDelete: 'CASCADE',
  })
  parent: MainCategory;

  @OneToMany(() => CategoryTwo, (catTwo) => catTwo.parent, { cascade: true })
  subCategories: CategoryTwo[];
}
