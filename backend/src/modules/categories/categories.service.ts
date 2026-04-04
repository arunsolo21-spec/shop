import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { priority: 'asc' },
        },
      },
      orderBy: { priority: 'asc' },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: categories.map((category) => ({
        ...category,
        image: this.buildImageUrl(category.image, baseUrl),
        subCategories: category.subCategories.map((sub) => ({
          ...sub,
          image: this.buildImageUrl(sub.image, baseUrl),
        })),
      })),
    };
  }

  async findActive() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
        },
      },
      orderBy: { priority: 'asc' },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: categories.map((category) => ({
        ...category,
        image: this.buildImageUrl(category.image, baseUrl),
        subCategories: category.subCategories.map((sub) => ({
          ...sub,
          image: this.buildImageUrl(sub.image, baseUrl),
        })),
      })),
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: {
        ...category,
        image: this.buildImageUrl(category.image, baseUrl),
        subCategories: category.subCategories.map((sub) => ({
          ...sub,
          image: this.buildImageUrl(sub.image, baseUrl),
        })),
      },
    };
  }

  async create(dto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: dto,
      include: {
        subCategories: true,
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      message: 'Category created successfully',
      data: {
        ...category,
        image: this.buildImageUrl(category.image, baseUrl),
      },
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      const duplicateCategory = await this.prisma.category.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });
      if (duplicateCategory) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        subCategories: true,
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      message: 'Category updated successfully',
      data: {
        ...category,
        image: this.buildImageUrl(category.image, baseUrl),
        subCategories: category.subCategories.map((sub) => ({
          ...sub,
          image: this.buildImageUrl(sub.image, baseUrl),
        })),
      },
    };
  }

  async delete(id: number) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (existingCategory.subCategories.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Delete subcategories first.',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  async createSubCategory(
    categoryId: number,
    dto: { name: string; image?: string; priority?: number },
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingSubCategory = await this.prisma.subCategory.findFirst({
      where: {
        name: dto.name,
        categoryId,
      },
    });

    if (existingSubCategory) {
      throw new BadRequestException('Subcategory with this name already exists in this category');
    }

    const subCategory = await this.prisma.subCategory.create({
      data: {
        ...dto,
        categoryId,
        isActive: true,
        priority: dto.priority ?? 0,
      },
      include: {
        category: true,
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      message: 'Subcategory created successfully',
      data: {
        ...subCategory,
        image: this.buildImageUrl(subCategory.image, baseUrl),
      },
    };
  }

  async deleteSubCategory(subCategoryId: number) {
    const existingSubCategory = await this.prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      include: {
        products: true,
      },
    });

    if (!existingSubCategory) {
      throw new NotFoundException('Subcategory not found');
    }

    if (existingSubCategory.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete subcategory with products. Delete or reassign products first.',
      );
    }

    await this.prisma.subCategory.delete({
      where: { id: subCategoryId },
    });

    return {
      success: true,
      message: 'Subcategory deleted successfully',
    };
  }

  private buildImageUrl(imageUrl: string | null | undefined, baseUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'https://via.placeholder.com/150x150?text=Category';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
      return `${baseUrl}${imageUrl}`;
    }

    return `${baseUrl}/${imageUrl}`;
  }
}