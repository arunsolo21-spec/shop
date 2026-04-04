import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    const dairyCategory = await prisma.category.findFirst({
      where: { name: 'DAIRY & BAKERY' },
      include: { subCategories: true },
    });

    const fruitsCategory = await prisma.category.findFirst({
      where: { name: 'FRUITS & VEGETABLES' },
      include: { subCategories: true },
    });

    const snacksCategory = await prisma.category.findFirst({
      where: { name: 'SNACKS & MUNCHIES' },
      include: { subCategories: true },
    });

    const butterSubCat = dairyCategory?.subCategories.find((sc) => sc.name === 'Butter');
    const milkSubCat = dairyCategory?.subCategories.find((sc) => sc.name === 'Milk');
    const breadSubCat = dairyCategory?.subCategories.find((sc) => sc.name === 'Bread');
    const onionSubCat = fruitsCategory?.subCategories.find((sc) => sc.name === 'Onions');
    const tomatoSubCat = fruitsCategory?.subCategories.find((sc) => sc.name === 'Tomatoes');
    const chipsSubCat = snacksCategory?.subCategories.find((sc) => sc.name === 'Chips');

    await prisma.product.deleteMany();

    await prisma.product.createMany({
      data: [
        {
          name: 'Amul Butter',
          brand: 'Amul',
          variant: '100g',
          price: 50,
          mrp: 55,
          discount: 9,
          description: 'Fresh white butter',
          shortDescription: 'Amul fresh butter',
          imageUrl: 'https://via.placeholder.com/150?text=Butter',
          inStock: true,
          quantity: 100,
          isFeatured: true,
          isBestseller: false,
          showOnHome: true,
          searchKeywords: ['butter', 'amul', 'dairy'],
          subCategoryId: butterSubCat?.id ?? null,
        },
        {
          name: 'Nandini Butter',
          brand: 'Nandini',
          variant: '200g',
          price: 110,
          mrp: 120,
          discount: 8,
          description: 'Premium white butter',
          shortDescription: 'Nandini butter',
          imageUrl: 'https://via.placeholder.com/150?text=Butter',
          inStock: true,
          quantity: 80,
          isFeatured: false,
          isBestseller: true,
          showOnHome: true,
          searchKeywords: ['butter', 'nandini', 'dairy'],
          subCategoryId: butterSubCat?.id ?? null,
        },
        {
          name: 'Amul Full Cream Milk',
          brand: 'Amul',
          variant: '1L',
          price: 60,
          mrp: 65,
          discount: 8,
          description: 'Full cream milk',
          shortDescription: 'Amul milk',
          imageUrl: 'https://via.placeholder.com/150?text=Milk',
          inStock: true,
          quantity: 200,
          isFeatured: true,
          isBestseller: true,
          showOnHome: true,
          searchKeywords: ['milk', 'amul', 'dairy'],
          subCategoryId: milkSubCat?.id ?? null,
        },
        {
          name: 'Fresh Bread',
          brand: 'Harvest Gold',
          variant: '400g',
          price: 40,
          mrp: 45,
          discount: 11,
          description: 'Fresh baked bread',
          shortDescription: 'Harvest Gold bread',
          imageUrl: 'https://via.placeholder.com/150?text=Bread',
          inStock: true,
          quantity: 50,
          isFeatured: false,
          isBestseller: false,
          showOnHome: true,
          searchKeywords: ['bread', 'bakery', 'harvest gold'],
          subCategoryId: breadSubCat?.id ?? null,
        },
        {
          name: 'Red Onions',
          brand: 'Fresh Farms',
          variant: '1kg',
          price: 30,
          mrp: 40,
          discount: 25,
          description: 'Fresh red onions',
          shortDescription: 'Red onions 1kg',
          imageUrl: 'https://via.placeholder.com/150?text=Onions',
          inStock: true,
          quantity: 500,
          isFeatured: true,
          isBestseller: true,
          showOnHome: true,
          searchKeywords: ['onion', 'vegetables', 'red onion'],
          subCategoryId: onionSubCat?.id ?? null,
        },
        {
          name: 'Fresh Tomatoes',
          brand: 'Fresh Farms',
          variant: '1kg',
          price: 40,
          mrp: 50,
          discount: 20,
          description: 'Fresh tomatoes',
          shortDescription: 'Tomatoes 1kg',
          imageUrl: 'https://via.placeholder.com/150?text=Tomatoes',
          inStock: true,
          quantity: 300,
          isFeatured: false,
          isBestseller: false,
          showOnHome: true,
          searchKeywords: ['tomato', 'vegetables', 'fresh'],
          subCategoryId: tomatoSubCat?.id ?? null,
        },
        {
          name: 'Lays Chips',
          brand: 'Lays',
          variant: '50g',
          price: 20,
          mrp: 20,
          discount: 0,
          description: 'Classic salted chips',
          shortDescription: 'Lays chips 50g',
          imageUrl: 'https://via.placeholder.com/150?text=Chips',
          inStock: true,
          quantity: 200,
          isFeatured: true,
          isBestseller: true,
          showOnHome: true,
          searchKeywords: ['chips', 'lays', 'snacks'],
          subCategoryId: chipsSubCat?.id ?? null,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Product seeding failed:', error);
    throw error;
  }
}

seedProducts()
  .catch((e) => {
    console.error('Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });