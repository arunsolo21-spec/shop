import * as fs from 'fs';
import * as path from 'path';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  variant: string;
  pricing: {
    price: number;
    mrp: number;
    discount: number;
    currency: string;
  };
  description: {
    short: string;
    long: string;
  };
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
  }>;
  search_keywords: {
    english: string[];
    tanglish: string[];
  };
  inventory: {
    in_stock: boolean;
    quantity: number;
  };
  display: {
    is_featured: boolean;
    is_bestseller: boolean;
    show_on_home: boolean;
  };
}

// Map small categories to parent categories
const CATEGORY_MERGE_MAP: { [key: string]: string } = {
  'Cooking Oils & Ghee': 'Cooking Oils',
  'Ghee': 'Cooking Oils',
  'Salt & Sugar': 'Spices & Masalas',
  'Health Drinks': 'Health & Wellness',
  'Sauces & Spreads': 'Spices & Masalas',
  'Tobacco': 'Others',
};

function mergeSmallCategories() {
  const inputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'master_products_final.json');
  const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'master_products_merged.json');
  
  console.log('🔄 Starting small category merge...\n');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: File not found at ${inputPath}`);
    process.exit(1);
  }
  
  let products: Product[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`✅ Loaded ${products.length} products\n`);
  
  const mergeStats: { [key: string]: { count: number; target: string } } = {};
  let totalMerged = 0;
  
  products.forEach(product => {
    const oldCategory = product.category;
    const newCategory = CATEGORY_MERGE_MAP[oldCategory];
    
    if (newCategory) {
      product.category = newCategory;
      totalMerged++;
      
      if (!mergeStats[oldCategory]) {
        mergeStats[oldCategory] = { count: 0, target: newCategory };
      }
      mergeStats[oldCategory].count++;
    }
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 CATEGORY MERGE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Products:              ${products.length}`);
  console.log(`Categories Merged:           ${totalMerged}`);
  console.log(`Output File:                 ${outputPath}`);
  console.log('='.repeat(80));
  console.log('\n📝 Merge Details:');
  console.log('-'.repeat(80));
  
  Object.entries(mergeStats).forEach(([from, data], index) => {
    console.log(`   ${index + 1}. ${from.padEnd(25)} → ${data.target.padEnd(25)} (${data.count} products)`);
  });
  
  console.log('-'.repeat(80));
  
  const categoryCount: { [key: string]: number } = {};
  products.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
  });
  
  console.log('\n📊 Final Category Breakdown:');
  console.log('-'.repeat(80));
  
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count], index) => {
      const marker = count < 10 ? '⚠️' : '✅';
      console.log(`   ${String(index + 1).padStart(2)}. ${marker} ${category.padEnd(30)} ${String(count).padStart(5)} products`);
    });
  
  console.log('-'.repeat(80));
  console.log('\n✨ Small category merge completed successfully!\n');
}

mergeSmallCategories();