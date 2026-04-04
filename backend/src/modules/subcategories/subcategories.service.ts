import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const subcategories = await this.prisma.subCategory.findMany({
      include: {
        category: true,
      },
      orderBy: { priority: 'asc' },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: subcategories.map((sub) => ({
        ...sub,
        image: this.buildImageUrl(sub.image, baseUrl),
      })),
    };
  }

  async findByCategory(categoryId: number) {
    const subcategories = await this.prisma.subCategory.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
      orderBy: { priority: 'asc' },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: subcategories.map((sub) => ({
        ...sub,
        image: this.buildImageUrl(sub.image, baseUrl),
      })),
    };
  }

  async findOne(id: number) {
    const subcategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: {
        ...subcategory,
        image: this.buildImageUrl(subcategory.image, baseUrl),
      },
    };
  }

  async create(dto: any) {
    const categoryId = typeof dto.categoryId === 'string' ? parseInt(dto.categoryId, 10) : dto.categoryId;

    if (!categoryId || isNaN(categoryId)) {
      throw new BadRequestException('Invalid category ID');
    }

    const existingSubcategory = await this.prisma.subCategory.findFirst({
      where: {
        name: dto.name,
        categoryId: categoryId,
      },
    });

    if (existingSubcategory) {
      throw new BadRequestException('Subcategory already exists in this category');
    }

    const subcategory = await this.prisma.subCategory.create({
      data: {
        name: dto.name,
        categoryId: categoryId,
        image: dto.image || null,
        isActive: dto.isActive ?? true,
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
        ...subcategory,
        image: this.buildImageUrl(subcategory.image, baseUrl),
      },
    };
  }

  async update(id: number, dto: any) {
    const existingSubcategory = await this.prisma.subCategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    const categoryId = dto.categoryId
      ? typeof dto.categoryId === 'string'
        ? parseInt(dto.categoryId, 10)
        : dto.categoryId
      : undefined;

    if (dto.name && categoryId) {
      const duplicateSubcategory = await this.prisma.subCategory.findFirst({
        where: {
          name: dto.name,
          categoryId: categoryId,
          id: { not: id },
        },
      });
      if (duplicateSubcategory) {
        throw new BadRequestException('Subcategory already exists in this category');
      }
    }

    const updateData: any = {
      name: dto.name,
      image: dto.image,
      isActive: dto.isActive,
      priority: dto.priority,
    };

    if (categoryId) {
      updateData.categoryId = categoryId;
    }

    const subcategory = await this.prisma.subCategory.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      message: 'Subcategory updated successfully',
      data: {
        ...subcategory,
        image: this.buildImageUrl(subcategory.image, baseUrl),
      },
    };
  }

  async updateStatus(id: number, isActive: boolean) {
    const existingSubcategory = await this.prisma.subCategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    const subcategory = await this.prisma.subCategory.update({
      where: { id },
      data: { isActive },
      include: {
        category: true,
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      message: 'Subcategory status updated successfully',
      data: {
        ...subcategory,
        image: this.buildImageUrl(subcategory.image, baseUrl),
      },
    };
  }

  async delete(id: number) {
    const existingSubcategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        products: true,
        category: true,
      },
    });

    if (!existingSubcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    let generalSubcategory = await this.prisma.subCategory.findFirst({
      where: {
        categoryId: existingSubcategory.categoryId,
        name: 'General',
      },
    });

    if (!generalSubcategory) {
      generalSubcategory = await this.prisma.subCategory.create({
        data: {
          name: 'General',
          categoryId: existingSubcategory.categoryId,
          isActive: true,
          priority: 0,
        },
      });
    }

    if (existingSubcategory.products.length > 0) {
      await this.prisma.product.updateMany({
        where: { subCategoryId: id },
        data: { subCategoryId: generalSubcategory.id },
      });
    }

    await this.prisma.subCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Subcategory deleted. ${existingSubcategory.products.length} products moved to "General"`,
    };
  }

  private buildImageUrl(imageUrl: string | null | undefined, baseUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'https://via.placeholder.com/150x150?text=Subcategory';
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