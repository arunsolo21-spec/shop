import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  async getAllSubcategories(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      return this.subcategoriesService.findByCategory(parsedCategoryId);
    }
    return this.subcategoriesService.findAll();
  }

  @Get(':id')
  async getSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.subcategoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSubcategory(@Body() dto: any) {
    if (!dto.name || !dto.categoryId) {
      throw new BadRequestException('Name and categoryId are required');
    }
    return this.subcategoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.subcategoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.subcategoriesService.delete(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.subcategoriesService.updateStatus(id, isActive);
  }
}