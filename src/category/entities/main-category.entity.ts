import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/types/base-entity';
import { CategoryOne } from './category-one.entity';

@Entity()
export class MainCategory extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category_heading_font_color: string;

  @Column({ nullable: true })
  categories_color: string;

  @Column({ nullable: true })
  font_color: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CategoryOne, (categoryOne) => categoryOne.parent, {
    cascade: true,
  })
  subCategories: CategoryOne[];
}
