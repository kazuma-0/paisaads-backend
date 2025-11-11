import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MainCategory } from './entities/main-category.entity';
import { CategoryOne } from './entities/category-one.entity';
import { CategoryTwo } from './entities/category-two.entity';
import { CategoryThree } from './entities/category-three.entity';
import { CreateMainCategoryDto } from './dto/create-category-tree.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(MainCategory)
    private mainCategoryRepo: Repository<MainCategory>,

    @InjectRepository(CategoryOne)
    private categoryOneRepo: Repository<CategoryOne>,

    @InjectRepository(CategoryTwo)
    private categoryTwoRepo: Repository<CategoryTwo>,

    @InjectRepository(CategoryThree)
    private categoryThreeRepo: Repository<CategoryThree>,
  ) {}

  async createMainCategoryTree(
    dto: CreateMainCategoryDto,
  ): Promise<MainCategory> {
    const mainCat = this.mainCategoryRepo.create({
      ...dto,
      subCategories: dto.subCategories?.map((cat1) => ({
        ...cat1,
        subCategories: cat1.subCategories?.map((cat2) => ({
          ...cat2,
          subCategories: cat2.subCategories?.map((cat3) => ({ ...cat3 })),
        })),
      })),
    });
    return this.mainCategoryRepo.save(mainCat);
  }

  async findAllTrees(): Promise<MainCategory[]> {
    return this.mainCategoryRepo.find({
      relations: [
        'subCategories',
        'subCategories.subCategories',
        'subCategories.subCategories.subCategories',
      ],
      order: {
        name: 'ASC',
        subCategories: {
          name: 'ASC',
          subCategories: {
            name: 'ASC',
            subCategories: {
              name: 'ASC',
            },
          },
        },
      },
    });
  }

  async findMainCategoryById(id: string): Promise<MainCategory> {
    const cat = await this.mainCategoryRepo.findOne({
      where: { id },
      relations: [
        'subCategories',
        'subCategories.subCategories',
        'subCategories.subCategories.subCategories',
      ],
    });
    if (!cat) throw new NotFoundException('MainCategory not found');
    return cat;
  }

  async addMainCategory(dto: {
    name: string;
    category_heading_font_color?: string;
    categories_color?: string;
    font_color?: string;
    isActive?: boolean;
  }) {
    const mainCat = this.mainCategoryRepo.create(dto);
    return this.mainCategoryRepo.save(mainCat);
  }

  async addCategoryOne(
    parentMainCategoryId: string,
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    const parent = await this.mainCategoryRepo.findOne({
      where: { id: parentMainCategoryId },
    });
    if (!parent) throw new NotFoundException('MainCategory not found');

    const categoryOne = this.categoryOneRepo.create({
      ...dto,
      parent,
    });
    return this.categoryOneRepo.save(categoryOne);
  }

  async addCategoryTwo(
    parentCategoryOneId: string,
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    const parent = await this.categoryOneRepo.findOne({
      where: { id: parentCategoryOneId },
    });
    if (!parent) throw new NotFoundException('CategoryOne not found');

    const categoryTwo = this.categoryTwoRepo.create({
      ...dto,
      parent,
    });
    return this.categoryTwoRepo.save(categoryTwo);
  }

  async addCategoryThree(
    parentCategoryTwoId: string,
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    const parent = await this.categoryTwoRepo.findOne({
      where: { id: parentCategoryTwoId },
    });
    if (!parent) throw new NotFoundException('CategoryTwo not found');

    const categoryThree = this.categoryThreeRepo.create({
      ...dto,
      parent,
    });
    return this.categoryThreeRepo.save(categoryThree);
  }

  async updateMainCategory(
    id: string,
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      categories_color?: string;
      font_color?: string;
      keywords?: string[];
      isActive?: boolean;
    }>,
  ) {
    const entity = await this.mainCategoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('MainCategory not found');
    Object.assign(entity, dto);
    return this.mainCategoryRepo.save(entity);
  }

  async updateCategoryOne(
    id: string,
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    const entity = await this.categoryOneRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryOne not found');
    Object.assign(entity, dto);
    return this.categoryOneRepo.save(entity);
  }

  async updateCategoryTwo(
    id: string,
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    const entity = await this.categoryTwoRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryTwo not found');
    Object.assign(entity, dto);
    return this.categoryTwoRepo.save(entity);
  }

  async updateCategoryThree(
    id: string,
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    const entity = await this.categoryThreeRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryThree not found');
    Object.assign(entity, dto);
    return this.categoryThreeRepo.save(entity);
  }

  async deleteMainCategory(id: string) {
    const entity = await this.mainCategoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('MainCategory not found');
    await this.mainCategoryRepo.remove(entity);
    return { message: 'MainCategory deleted' };
  }

  async deleteCategoryOne(id: string) {
    const entity = await this.categoryOneRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryOne not found');
    await this.categoryOneRepo.remove(entity);
    return { message: 'CategoryOne deleted' };
  }

  async deleteCategoryTwo(id: string) {
    const entity = await this.categoryTwoRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryTwo not found');
    await this.categoryTwoRepo.remove(entity);
    return { message: 'CategoryTwo deleted' };
  }

  async deleteCategoryThree(id: string) {
    const entity = await this.categoryThreeRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('CategoryThree not found');
    await this.categoryThreeRepo.remove(entity);
    return { message: 'CategoryThree deleted' };
  }

  async findCategoryOneById(id: string): Promise<CategoryOne | null> {
    const cat = await this.categoryOneRepo.findOne({ where: { id } });
    return cat;
  }

  async findCategoryTwoById(id: string): Promise<CategoryTwo | null> {
    const cat = await this.categoryTwoRepo.findOne({ where: { id } });
    return cat;
  }

  async findCategoryThreeById(id: string): Promise<CategoryThree | null> {
    const cat = await this.categoryThreeRepo.findOne({ where: { id } });
    return cat;
  }
}
