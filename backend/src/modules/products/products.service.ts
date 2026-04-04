import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  subCategoryId?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async getProducts(params: GetProductsParams) {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      subCategoryId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock,
    } = params;

    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (search && search.trim().length > 0) {
      const searchTerm = search.toLowerCase().trim();
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { brand: { contains: searchTerm, mode: 'insensitive' } },
        { searchKeywords: { has: searchTerm } },
      ];
    }

    if (subCategoryId) {
      whereClause.subCategoryId = subCategoryId;
    } else if (categoryId) {
      whereClause.subCategory = { categoryId };
    }

    if (minPrice !== undefined) {
      whereClause.price = { ...whereClause.price, gte: minPrice };
    }
    if (maxPrice !== undefined) {
      whereClause.price = { ...whereClause.price, lte: maxPrice };
    }
    if (inStock !== undefined) {
      whereClause.inStock = inStock;
    }

    const orderByClause: any = {};
    if (search) {
      orderByClause.name = 'asc';
    } else if (sortBy === 'name') {
      orderByClause.name = sortOrder || 'asc';
    } else if (sortBy === 'price') {
      orderByClause.price = sortOrder || 'asc';
    } else {
      orderByClause.createdAt = sortOrder || 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        include: {
          subCategory: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: orderByClause,
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: {
        data: products.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          variant: product.variant,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount,
          description: product.description,
          shortDescription: product.shortDescription,
          imageUrl: this.buildImageUrl(product.imageUrl, baseUrl),
          inStock: product.inStock,
          quantity: product.quantity,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          showOnHome: product.showOnHome,
          searchKeywords: product.searchKeywords,
          subCategoryId: product.subCategoryId,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
          subCategory: product.subCategory
            ? {
                id: product.subCategory.id,
                name: product.subCategory.name,
                image: product.subCategory.image,
                isActive: product.subCategory.isActive,
                priority: product.subCategory.priority,
                categoryId: product.subCategory.categoryId,
                category: product.subCategory.category
                  ? {
                      id: product.subCategory.category.id,
                      name: product.subCategory.category.name,
                      image: product.subCategory.category.image,
                      isActive: product.subCategory.category.isActive,
                      priority: product.subCategory.category.priority,
                    }
                  : null,
              }
            : null,
        })),
        total,
        page,
        pageSize: limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        variant: product.variant,
        price: product.price,
        mrp: product.mrp,
        discount: product.discount,
        description: product.description,
        shortDescription: product.shortDescription,
        imageUrl: this.buildImageUrl(product.imageUrl, baseUrl),
        inStock: product.inStock,
        quantity: product.quantity,
        isFeatured: product.isFeatured,
        isBestseller: product.isBestseller,
        showOnHome: product.showOnHome,
        searchKeywords: product.searchKeywords,
        subCategoryId: product.subCategoryId,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        subCategory: product.subCategory
          ? {
              id: product.subCategory.id,
              name: product.subCategory.name,
              image: product.subCategory.image,
              isActive: product.subCategory.isActive,
              priority: product.subCategory.priority,
              categoryId: product.subCategory.categoryId,
              category: product.subCategory.category
                ? {
                    id: product.subCategory.category.id,
                    name: product.subCategory.category.name,
                    image: product.subCategory.category.image,
                    isActive: product.subCategory.category.isActive,
                    priority: product.subCategory.category.priority,
                  }
                : null,
            }
          : null,
      },
    };
  }

  async getProductsByIds(productIds: string[]) {
    if (!productIds || productIds.length === 0) {
      return { success: true, data: { data: [], total: 0, page: 1, pageSize: 0, totalPages: 0, hasMore: false } };
    }

    const ids = productIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
        inStock: true,
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: {
        data: products.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          variant: product.variant,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount,
          description: product.description,
          shortDescription: product.shortDescription,
          imageUrl: this.buildImageUrl(product.imageUrl, baseUrl),
          inStock: product.inStock,
          quantity: product.quantity,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          showOnHome: product.showOnHome,
          searchKeywords: product.searchKeywords,
          subCategoryId: product.subCategoryId,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        })),
        total: products.length,
        page: 1,
        pageSize: products.length,
        totalPages: 1,
        hasMore: false,
      },
    };
  }

  async createProduct(dto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: dto.name,
        brand: dto.brand,
        variant: dto.variant || '',
      },
    });

    if (existingProduct) {
      throw new BadRequestException('Product with this name, brand, and variant already exists');
    }

    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory) {
        throw new BadRequestException('Subcategory not found');
      }
    }

    const discount =
      dto.discount !== undefined
        ? dto.discount
        : dto.mrp && dto.price
        ? Math.round(((dto.mrp - dto.price) / dto.mrp) * 100)
        : 0;

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        brand: dto.brand,
        variant: dto.variant || '',
        price: dto.price,
        mrp: dto.mrp,
        discount: discount,
        description: dto.description || null,
        shortDescription: dto.shortDescription || null,
        imageUrl: dto.imageUrl || null,
        inStock: dto.inStock ?? true,
        quantity: dto.quantity ?? 0,
        isFeatured: dto.isFeatured ?? false,
        isBestseller: dto.isBestseller ?? false,
        showOnHome: dto.showOnHome ?? true,
        searchKeywords: dto.searchKeywords || [],
        subCategoryId: dto.subCategoryId || null,
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (dto.name || dto.brand || dto.variant) {
      const duplicate = await this.prisma.product.findFirst({
        where: {
          name: dto.name || existingProduct.name,
          brand: dto.brand || existingProduct.brand,
          variant: dto.variant || existingProduct.variant,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new BadRequestException('Product with this name, brand, and variant already exists');
      }
    }

    if (dto.subCategoryId && dto.subCategoryId !== existingProduct.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory) {
        throw new BadRequestException('Subcategory not found');
      }
    }

    const updateData: any = { ...dto };
    if (dto.price !== undefined || dto.mrp !== undefined) {
      const newPrice = dto.price ?? existingProduct.price;
      const newMrp = dto.mrp ?? existingProduct.mrp;
      if (newMrp && newPrice) {
        updateData.discount = Math.round(((newMrp - newPrice) / newMrp) * 100);
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async deleteProduct(id: number) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { cartItems: true, orderItems: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (existingProduct.cartItems.length > 0 || existingProduct.orderItems.length > 0) {
      throw new BadRequestException('Cannot delete product that is in active carts or orders');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  async updateStock(id: number, quantity: number, inStock: boolean) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        quantity,
        inStock,
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Stock updated successfully',
      data: product,
    };
  }

  async getFeaturedProducts(limit: number = 12) {
    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
        inStock: true,
        showOnHome: true,
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        variant: product.variant,
        price: product.price,
        mrp: product.mrp,
        discount: product.discount,
        imageUrl: this.buildImageUrl(product.imageUrl, baseUrl),
        inStock: product.inStock,
        isFeatured: product.isFeatured,
      })),
    };
  }

  async getBestsellers(limit: number = 12) {
    const products = await this.prisma.product.findMany({
      where: {
        isBestseller: true,
        inStock: true,
        showOnHome: true,
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    return {
      success: true,
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        variant: product.variant,
        price: product.price,
        mrp: product.mrp,
        discount: product.discount,
        imageUrl: this.buildImageUrl(product.imageUrl, baseUrl),
        inStock: product.inStock,
        isBestseller: product.isBestseller,
      })),
    };
  }

  private buildImageUrl(imageUrl: string | null | undefined, baseUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'https://via.placeholder.com/300x300?text=Product';
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