import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Seeding banners...');

  const banners = [
    {
      imageUrl: 'https://via.placeholder.com/400x180/FF6B35/FFFFFF?text=Fresh+Produce',
      targetScreen: 'products',
      targetId: null,
      priority: 0,
      isActive: true,
    },
    {
      imageUrl: 'https://via.placeholder.com/400x180/10B981/FFFFFF?text=50%+OFF',
      targetScreen: 'categories',
      targetId: null,
      priority: 1,
      isActive: true,
    },
    {
      imageUrl: 'https://via.placeholder.com/400x180/4ECDC4/FFFFFF?text=Free+Delivery',
      targetScreen: 'home',
      targetId: null,
      priority: 2,
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  console.log(`✅ Created ${banners.length} banners`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());