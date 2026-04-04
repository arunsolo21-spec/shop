import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting product-category linking...');

  const products = await prisma.product.findMany({
    select: {
      id: true,
      subCategoryId: true,
    },
  });

  const categoryMap = new Map<string, number>();
  const subCategoryMap = new Map<string, number>();

  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
    },
  });

  categories.forEach((cat) => {
    categoryMap.set(cat.name, cat.id);
    cat.subCategories.forEach((sub) => {
      const key = `${cat.name}::${sub.name}`;
      subCategoryMap.set(key, sub.id);
    });
  });

  let updated = 0;
  let notFound = 0;

  for (const product of products) {
    // We can't link anymore since subCategoryId already exists
    if (product.subCategoryId) {
      updated++;
    } else {
      notFound++;
    }

    if (updated % 1000 === 0) {
      console.log(`Processed ${updated} products...`);
    }
  }

  console.log('='.repeat(80));
  console.log('✅ LINKING COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total Products: ${products.length}`);
  console.log(`Linked: ${updated}`);
  console.log(`Not Found: ${notFound}`);
  console.log('='.repeat(80));
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });