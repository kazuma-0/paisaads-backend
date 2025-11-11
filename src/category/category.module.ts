import { Module } from '@nestjs/common';
import { CategoriesController } from './category.controller';
import { CategoriesService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainCategory } from './entities/main-category.entity';
import { CategoryOne } from './entities/category-one.entity';
import { CategoryThree } from './entities/category-three.entity';
import { CategoryTwo } from './entities/category-two.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MainCategory,
      CategoryOne,
      CategoryTwo,
      CategoryThree,
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoryModule {}
