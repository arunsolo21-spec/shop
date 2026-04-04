import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerLinkType } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const banners = await this.prisma.banner.findMany({
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: banners };
  }

  async findActive() {
    const now = new Date();
    const banners = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
        ],
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: banners };
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return { success: true, data: banner };
  }

  async create(dto: CreateBannerDto) {
    try {
      if (dto.linkType === BannerLinkType.PRODUCT && dto.targetId) {
        const product = await this.prisma.product.findUnique({
          where: { id: parseInt(dto.targetId) },
        });
        if (!product) {
          throw new BadRequestException('Product not found');
        }
      }

      if (dto.linkType === BannerLinkType.CATEGORY && dto.targetId) {
        const category = await this.prisma.category.findUnique({
          where: { id: parseInt(dto.targetId) },
        });
        if (!category) {
          throw new BadRequestException('Category not found');
        }
      }

      if (dto.linkType === BannerLinkType.MULTIPLE_PRODUCTS && dto.targetIds && dto.targetIds.length > 0) {
        const productIds = dto.targetIds.map(id => parseInt(id));
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
          throw new BadRequestException('One or more products not found');
        }
      }

      const banner = await this.prisma.banner.create({
        data: {
          imageUrl: dto.imageUrl,
          title: dto.title,
          subtitle: dto.subtitle,
          ctaText: dto.ctaText,
          linkType: dto.linkType || BannerLinkType.NONE,
          linkId: dto.linkId,
          linkUrl: dto.linkUrl,
          targetScreen: dto.targetScreen || 'home',
          targetId: dto.targetId,
          targetIds: dto.targetIds || [],
          isActive: dto.isActive ?? true,
          priority: dto.priority ?? 0,
          discount: dto.discount ?? 0,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        },
      });
      return { success: true, message: 'Banner created successfully', data: banner };
    } catch (error: any) {
      throw new BadRequestException('Failed to create banner: ' + error.message);
    }
  }

  async update(id: number, dto: UpdateBannerDto) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    if (dto.targetScreen === 'category' && dto.targetId) {
      const category = await this.prisma.category.findUnique({
        where: { id: parseInt(dto.targetId) },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    if (dto.targetScreen === 'products' && dto.targetId) {
      const product = await this.prisma.product.findUnique({
        where: { id: parseInt(dto.targetId) },
      });
      if (!product) {
        throw new BadRequestException('Product not found');
      }
    }

    const banner = await this.prisma.banner.update({
      where: { id },
      data: {
        imageUrl: dto.imageUrl,
        targetScreen: dto.targetScreen,
        targetId: dto.targetId,
        targetIds: dto.targetIds,
        isActive: dto.isActive,
        priority: dto.priority,
        discount: dto.discount,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        title: dto.title,
        subtitle: dto.subtitle,
      },
    });
    return { success: true, message: 'Banner updated successfully', data: banner };
  }

  async delete(id: number) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }
    await this.prisma.banner.delete({ where: { id } });
    return { success: true, message: 'Banner deleted successfully' };
  }

  async updatePriority(id: number, priority: number) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }
    if (priority < 0) {
      throw new BadRequestException('Priority cannot be negative');
    }
    const banner = await this.prisma.banner.update({
      where: { id },
      data: { priority },
    });
    return { success: true, message: 'Banner priority updated successfully', data: banner };
  }

  async toggleStatus(id: number) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }
    const banner = await this.prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    return { success: true, message: 'Banner status toggled successfully', data: banner };
  }
}