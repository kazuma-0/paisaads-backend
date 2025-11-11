import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreateMainCategoryDto } from './dto/create-category-tree.dto';
import { CategoriesService } from './category.service';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('tree')
  @Roles(Role.SUPER_ADMIN)
  async createTree(@Body() dto: CreateMainCategoryDto) {
    return this.categoriesService.createMainCategoryTree(dto);
  }

  @Post('main')
  async createMain(
    @Body()
    dto: {
      name: string;
      category_heading_font_color?: string;
      categories_color?: string;
      font_color?: string;
      isActive?: boolean;
    },
  ) {
    return this.categoriesService.addMainCategory(dto);
  }

  @Post('main/:mainId/one')
  async createOne(
    @Param('mainId') mainId: string,
    @Body()
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    return this.categoriesService.addCategoryOne(mainId, dto);
  }

  @Post('one/:oneId/two')
  async createTwo(
    @Param('oneId') oneId: string,
    @Body()
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    return this.categoriesService.addCategoryTwo(oneId, dto);
  }

  @Post('two/:twoId/three')
  async createThree(
    @Param('twoId') twoId: string,
    @Body()
    dto: {
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    },
  ) {
    return this.categoriesService.addCategoryThree(twoId, dto);
  }

  @Get('tree')
  @Public()
  async getAllTrees() {
    return this.categoriesService.findAllTrees();
  }

  @Get('main/:id')
  async getMain(@Param('id') id: string) {
    return this.categoriesService.findMainCategoryById(id);
  }

  @Patch('main/:id')
  async updateMain(
    @Param('id') id: string,
    @Body()
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      categories_color?: string;
      font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    return this.categoriesService.updateMainCategory(id, dto);
  }

  @Patch('one/:id')
  async updateOne(
    @Param('id') id: string,
    @Body()
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    return this.categoriesService.updateCategoryOne(id, dto);
  }

  @Patch('two/:id')
  async updateTwo(
    @Param('id') id: string,
    @Body()
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    return this.categoriesService.updateCategoryTwo(id, dto);
  }

  @Patch('three/:id')
  async updateThree(
    @Param('id') id: string,
    @Body()
    dto: Partial<{
      name: string;
      category_heading_font_color?: string;
      isActive?: boolean;
    }>,
  ) {
    return this.categoriesService.updateCategoryThree(id, dto);
  }

  @Delete('main/:id')
  async deleteMain(@Param('id') id: string) {
    return this.categoriesService.deleteMainCategory(id);
  }

  @Delete('one/:id')
  async deleteOne(@Param('id') id: string) {
    return this.categoriesService.deleteCategoryOne(id);
  }

  @Delete('two/:id')
  async deleteTwo(@Param('id') id: string) {
    return this.categoriesService.deleteCategoryTwo(id);
  }

  @Delete('three/:id')
  async deleteThree(@Param('id') id: string) {
    return this.categoriesService.deleteCategoryThree(id);
  }
}
