import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { CategoryOne } from './category-one.entity';
import { CategoryThree } from './category-three.entity';
import { BaseEntity } from 'src/common/types/base-entity';

@Entity()
export class CategoryTwo extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  category_heading_font_color: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => CategoryOne, (co) => co.subCategories, {
    onDelete: 'CASCADE',
  })
  parent: CategoryOne;

  @OneToMany(() => CategoryThree, (catThree) => catThree.parent, {
    cascade: true,
  })
  subCategories: CategoryThree[];
}
