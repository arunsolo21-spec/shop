import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(private prisma: PrismaService) {}

  async getHomeLayout() {
    try {
      const [banners, categories] = await Promise.all([
        this.prisma.banner.findMany({
          where: { isActive: true },
          orderBy: { priority: 'asc' },
          select: {
            id: true,
            imageUrl: true,
            linkType: true,              // ✅ ADDED: Required for banner navigation
            targetScreen: true,
            targetId: true,
            targetIds: true,             // ✅ ADDED: Required for MULTIPLE_PRODUCTS
            discount: true,
            startDate: true,
            endDate: true,
            title: true,
            subtitle: true,
          },
        }),
        this.prisma.category.findMany({
          where: { isActive: true },
          orderBy: { priority: 'asc' },
          include: {
            subCategories: {
              where: { isActive: true },
              orderBy: { priority: 'asc' },
              select: {
                id: true,
                name: true,
                image: true,
                isActive: true,
                priority: true,
              },
            },
          },
        }),
      ]);

      const now = new Date();
      const validBanners = banners.filter((banner) => {
        if (!banner.startDate && !banner.endDate) return true;
        if (banner.startDate && banner.startDate > now) return false;
        if (banner.endDate && banner.endDate < now) return false;
        return true;
      });

      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

      return {
        success: true,
        data: {
          user: {
            id: 0,
            name: 'Guest',
            phone: '',
          },
          // ✅ FIXED: Banner mapping now includes linkType and targetIds
          banners: validBanners.map((b) => ({
            id: b.id,
            imageUrl: this.buildImageUrl(b.imageUrl, baseUrl),
            linkType: b.linkType,              // ✅ NOW INCLUDED
            targetScreen: b.targetScreen || 'home',
            targetId: b.targetId || '',
            targetIds: b.targetIds || [],      // ✅ NOW INCLUDED
            discount: b.discount ?? 0,
            validUntil: b.endDate ? b.endDate.toISOString() : null,
            title: b.title,
            subtitle: b.subtitle,
          })),
          directory: categories.map((c) => ({
            id: c.id,
            name: c.name,
            image: this.buildImageUrl(c.image, baseUrl),
            isActive: c.isActive,
            priority: c.priority,
            subCategories: c.subCategories.map((s) => ({
              id: s.id,
              name: s.name,
              imageUrl: this.buildImageUrl(s.image, baseUrl),
              isActive: s.isActive,
              priority: s.priority,
            })),
          })),
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to load home layout:', error.message);
      return {
        success: true,
        data: {
          user: { id: 0, name: 'Guest', phone: '' },
          banners: [],
          directory: [],
        },
        message: 'Home layout loaded with empty data due to error',
      };
    }
  }

  private buildImageUrl(
    imageUrl: string | null | undefined,
    baseUrl: string,
  ): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'https://via.placeholder.com/400x180?text=FreshMart';
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