import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting Tobacco category and subcategories...');

  const tobacco = await prisma.category.findFirst({
    where: { name: { contains: 'Tobacco', mode: 'insensitive' } },
    include: { subCategories: true },
  });

  if (tobacco) {
    const subCategoryCount = tobacco.subCategories.length;

    if (subCategoryCount > 0) {
      console.log(`📦 Deleting ${subCategoryCount} subcategories first...`);
      await prisma.subCategory.deleteMany({
        where: { categoryId: tobacco.id },
      });
      console.log(`✅ Deleted ${subCategoryCount} subcategories`);
    }

    await prisma.category.delete({
      where: { id: tobacco.id },
    });
    console.log(`✅ Deleted Tobacco category (ID: ${tobacco.id})`);
  } else {
    console.log('⚠️  Tobacco category not found');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });