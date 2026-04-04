import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const product = await prisma.product.create({
      data: {
        name: 'Final Test Product',
        brand: 'Test Brand',
        variant: '500g',
        price: 100,
        mrp: 120,
        discount: 15,
        description: 'Test',
        shortDescription: 'Test',
        imageUrl: 'test.png',
        inStock: true,
        quantity: 50,
        isFeatured: false,
        isBestseller: false,
        showOnHome: true,
        searchKeywords: ['test'],
        subCategoryId: 1,
      },
    });
    console.log('✅ Product created with ID:', product.id);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  await prisma.$disconnect();
}
test();