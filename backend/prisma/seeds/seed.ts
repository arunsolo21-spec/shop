import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RawProduct {
  id: number;
  name: string;
  brand: string;
  variant: string;
  pricing: { price: number; mrp: number; discount: number };
  description: { short: string; long: string };
  images: { url: string; alt: string; is_primary: boolean }[];
  search_keywords: { english: string[]; tanglish: string[] };
  inventory: { in_stock: boolean; quantity: number };
  display: { is_featured: boolean; is_bestseller: boolean; show_on_home: boolean };
  subCategory: string;
  category: string;
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  const seedFilePath = path.join(__dirname, 'master_products_final.json');
  if (!fs.existsSync(seedFilePath)) {
    console.error('❌ Error: master_products_final.json not found!');
    process.exit(1);
  }

  const fileSize = fs.statSync(seedFilePath).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  console.log(`📦 Seed file size: ${fileSizeMB} MB`);

  let rawProducts: RawProduct[] = [];
  try {
    const fileContent = fs.readFileSync(seedFilePath, 'utf-8');
    rawProducts = JSON.parse(fileContent);
    console.log(`✅ Loaded ${rawProducts.length} products from seed file\n`);
  } catch (error) {
    console.error('❌ Error parsing seed file:', error);
    process.exit(1);
  }

  console.log('📂 Step 1: Creating Categories...\n');
  const uniqueCategories = [...new Set(rawProducts.map((p) => p.category))];
  const categoryMap = new Map<string, number>();

  for (const categoryName of uniqueCategories) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        isActive: true,
        priority: 0,
      },
    });
    categoryMap.set(categoryName, category.id);
    console.log(`   ✅ Created category: ${categoryName}`);
  }

  console.log(`\n✅ Total Categories Created: ${categoryMap.size}\n`);

  console.log('📂 Step 2: Creating SubCategories...\n');
  const subCategoryMap = new Map<string, number>();

  for (const product of rawProducts) {
    const key = `${product.category}::${product.subCategory}`;
    if (!subCategoryMap.has(key)) {
      const categoryId = categoryMap.get(product.category);
      if (categoryId) {
        const subCategory = await prisma.subCategory.upsert({
          where: {
            name_categoryId: {
              name: product.subCategory,
              categoryId: categoryId,
            },
          },
          update: {},
          create: {
            name: product.subCategory,
            categoryId: categoryId,
            isActive: true,
            priority: 0,
          },
        });
        subCategoryMap.set(key, subCategory.id);
        console.log(`   ✅ Created subcategory: ${product.subCategory} under ${product.category}`);
      }
    }
  }

  console.log(`\n✅ Total SubCategories Created: ${subCategoryMap.size}\n`);

  console.log('📂 Step 3: Creating Products...\n');
  const validProducts = rawProducts.filter(
    (p) => p.name && p.brand && p.pricing?.price >= 0
  );

  await prisma.product.deleteMany();

  const BATCH_SIZE = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
    const batch = validProducts.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (rawProduct) => {
      try {
        const key = `${rawProduct.category}::${rawProduct.subCategory}`;
        const subCategoryId = subCategoryMap.get(key) ?? null;

        await prisma.product.create({
          data: {
            id: rawProduct.id,
            name: rawProduct.name,
            brand: rawProduct.brand,
            variant: rawProduct.variant,
            price: rawProduct.pricing.price,
            mrp: rawProduct.pricing.mrp,
            discount: rawProduct.pricing.discount,
            description: rawProduct.description.long,
            shortDescription: rawProduct.description.short,
            imageUrl: rawProduct.images.find((img) => img.is_primary)?.url ?? null,
            inStock: rawProduct.inventory.in_stock,
            quantity: rawProduct.inventory.quantity,
            isFeatured: rawProduct.display.is_featured,
            isBestseller: rawProduct.display.is_bestseller,
            showOnHome: rawProduct.display.show_on_home,
            searchKeywords: [
              ...(rawProduct.search_keywords.english || []),
              ...(rawProduct.search_keywords.tanglish || []),
            ]
              .filter(Boolean)
              .map((k) => k.toLowerCase().trim()),
            subCategoryId: subCategoryId,
          },
        });
        successCount++;
      } catch (error: any) {
        if (error.code !== 'P2002') {
          errorCount++;
        }
      }
    });

    await Promise.all(batchPromises);
    const processed = Math.min(i + BATCH_SIZE, validProducts.length);
    console.log(`   Processed ${processed}/${validProducts.length} products... (${((processed / validProducts.length) * 100).toFixed(1)}%)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Products in File:      ${rawProducts.length}`);
  console.log(`Valid Products:              ${validProducts.length}`);
  console.log(`Successfully Seeded:         ${successCount}`);
  console.log(`Failed:                      ${errorCount}`);
  console.log(`Categories Created:          ${categoryMap.size}`);
  console.log(`SubCategories Created:       ${subCategoryMap.size}`);
  console.log('='.repeat(80));
  console.log('\n✨ Database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  });