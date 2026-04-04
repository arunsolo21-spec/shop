import * as fs from 'fs';
import * as path from 'path';

interface Product {
  id?: number;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  variant: string;
  price: number;
  mrp?: number;
  discount?: number;
  in_stock: boolean;
  is_featured?: boolean;
  image_url: string;
  search_tags?: string[];
  description?: string;
}

interface CategoryMapping {
  [key: string]: string;
}

const CATEGORY_MAPPING: CategoryMapping = {
  // Rice & Grains
  'Rice & Grains': 'Rice & Rice Products',
  'Rice & Rice Products': 'Rice & Rice Products',
  'Atta & Flours': 'Atta, Flours & Mixes',
  
  // Dals & Pulses
  'Dals & Pulses': 'Dals, Pulses & Flours',
  'Dals & Pulses & Flours': 'Dals, Pulses & Flours',
  
  // Cooking Oils
  'Cooking Oils': 'Cooking Oils & Ghee',
  'Cooking Oil': 'Cooking Oils & Ghee',
  
  // Spices
  'Spices & Masala': 'Spices & Masalas',
  'Spices & Masalas': 'Spices & Masalas',
  
  // Beverages
  'Beverages': 'Beverages',
  'Tea & Coffee': 'Beverages',
  
  // Snacks
  'Snacks': 'Snacks & Chocolates',
  'Snacks & Chocolates': 'Snacks & Chocolates',
  'Chocolates & Candies': 'Snacks & Chocolates',
  'Chips & Snacks': 'Snacks & Chocolates',
  'Biscuits & Cookies': 'Biscuits & Cookies',
  
  // Dairy
  'Dairy & Fresh': 'Dairy & Bakery',
  'Dairy & Bakery': 'Dairy & Bakery',
  'Ice Creams': 'Dairy & Bakery',
  
  // Personal Care
  'Personal Care': 'Personal Care',
  'Bath & Body': 'Personal Care',
  'Hair Care': 'Personal Care',
  'Skin Care': 'Personal Care',
  'Men\'s Grooming': 'Personal Care',
  'Feminine Hygiene': 'Personal Care',
  'Oral Care': 'Personal Care',
  
  // Household
  'Household & Cleaning': 'Household & Cleaning',
  'Laundry Care': 'Household & Cleaning',
  'Dishwashing': 'Household & Cleaning',
  'Toilet & Floor Cleaners': 'Household & Cleaning',
  'Repellents & Fresheners': 'Household & Cleaning',
  
  // Pooja
  'Pooja Needs': 'Pooja Needs',
  
  // Baby
  'Baby Care': 'Baby Care',
  
  // Others that need redistribution
  'Others': 'REDISTRIBUTE',
  'Stationery': 'REDISTRIBUTE',
  'Stationery & Others': 'REDISTRIBUTE',
  'Health & Medical': 'Health & Wellness',
  'Mouth Freshener': 'Health & Wellness',
};

const SUBCATEGORY_KEYWORDS: { [key: string]: string[] } = {
  'Rice & Rice Products': ['rice', 'ponni', 'basmati', 'samba', 'brown rice', 'puffed rice', 'aval', 'semiya', 'noodles', 'pasta', 'vermicelli', 'rava', 'suji', 'maida', 'atta', 'flour', 'wheat', 'ragi', 'kambu', 'varagu', 'samai', 'kuthiraivali', 'thinai'],
  'Dals, Pulses & Flours': ['dal', 'paruppu', 'pulses', 'toor', 'moong', 'urad', 'chana', 'gram', 'peas', 'pattani', 'kadalai', 'payaru', 'besan', 'flour', 'maavu', 'puttu', 'idiyappam'],
  'Cooking Oils & Ghee': ['oil', 'ennai', 'coconut', 'gingelly', 'sunflower', 'groundnut', 'palm', 'ghee', 'nei', 'vanaspathi', 'dalda'],
  'Spices & Masalas': ['turmeric', 'manjal', 'chilli', 'milagai', 'coriander', 'malli', 'pepper', 'milagu', 'cumin', 'siragam', 'fenugreek', 'venthayam', 'garam masala', 'biryani', 'sambar', 'rasam', 'pod', 'podi', 'masala', 'pickle', 'urukai'],
  'Beverages': ['tea', 'thee', 'coffee', 'kaapi', 'horlicks', 'boost', 'complan', 'bournvita', 'drink', 'juice', 'soda', 'water', 'milkshake', 'energy drink', 'health drink'],
  'Snacks & Chocolates': ['snack', 'chocolate', 'candy', 'toffee', 'biscuit', 'cookie', 'namkeen', 'mixture', 'chips', 'wafer', 'cake', 'pastry', 'sweet', 'mittai'],
  'Dairy & Bakery': ['milk', 'paal', 'curd', 'yogurt', 'butter', 'vennai', 'cheese', 'paneer', 'bread', 'bun', 'bakery', 'ice cream', 'kulfi'],
  'Personal Care': ['soap', 'shampoo', 'toothpaste', 'toothbrush', 'talc', 'powder', 'cream', 'lotion', 'oil', 'hair', 'skin', 'bath', 'body', 'shaving', 'razor', 'blade', 'deodorant', 'perfume', 'attar', 'sanitary', 'pad', 'napkin'],
  'Household & Cleaning': ['detergent', 'washing', 'rin', 'tide', 'surf', 'arial', 'dishwash', 'vim', 'exo', 'pril', 'floor', 'cleaner', 'lizol', 'harpic', 'phenyl', 'bleach', 'mosquito', 'repellent', 'coil', 'all out', 'good knight', 'hit', 'freshener', 'odonil'],
  'Pooja Needs': ['pooja', 'sambrani', 'camphor', 'karpuram', 'soodam', 'vathi', 'agarbatti', 'incense', 'dhoop', 'kungumam', 'vibhuti', 'candle', 'deepam', 'oil lamp', 'abisegam'],
  'Baby Care': ['baby', 'infant', 'diaper', 'nappy', 'pampers', 'huggies', 'cerelac', 'farex', 'baby food', 'lotion', 'oil', 'soap', 'powder', 'cream'],
  'Health & Wellness': ['health', 'medical', 'medicine', 'vitamin', 'supplement', 'balm', 'ointment', 'inhaler', 'vicks', 'zandu', 'mouth freshener', 'paan', 'supari'],
  'Biscuits & Cookies': ['biscuit', 'cookie', 'marie', 'parity', 'cream', 'glucose', 'digestive', 'oats'],
  'Atta, Flours & Mixes': ['atta', 'flour', 'maida', 'rava', 'suji', 'mix', 'ready mix', 'puttu', 'idiyappam', 'dosa', 'idli', 'paniyaram', 'kuzhi', 'appam'],
};

function cleanProductName(name: string): string {
  return name
    .replace(/\s*\(\s*\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/liquiduid/gi, 'liquid')
    .replace(/liguid/gi, 'liquid')
    .replace(/sope/gi, 'soap')
    .replace(/blead/gi, 'blade')
    .replace(/scrup/gi, 'scrub')
    .replace(/filder/gi, 'filter')
    .replace(/\s*\.\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSubcategory(name: string, category: string): string {
  const nameLower = name.toLowerCase();
  const keywords = SUBCATEGORY_KEYWORDS[category] || [];
  
  for (const keyword of keywords) {
    if (nameLower.includes(keyword.toLowerCase())) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return 'General';
}

function redistributeOthersProduct(product: Product): string {
  const nameLower = product.name.toLowerCase();
  
  if (nameLower.includes('pen') || nameLower.includes('pencil') || nameLower.includes('notebook') || nameLower.includes('paper') || nameLower.includes('battery') || nameLower.includes('bulb') || nameLower.includes('charger') || nameLower.includes('cable')) {
    return 'Stationery & Others';
  }
  
  if (nameLower.includes('rice') || nameLower.includes('flour') || nameLower.includes('atta')) {
    return 'Rice & Rice Products';
  }
  
  if (nameLower.includes('dal') || nameLower.includes('paruppu') || nameLower.includes('pulse')) {
    return 'Dals, Pulses & Flours';
  }
  
  if (nameLower.includes('oil') || nameLower.includes('ennai') || nameLower.includes('ghee')) {
    return 'Cooking Oils & Ghee';
  }
  
  if (nameLower.includes('soap') || nameLower.includes('shampoo') || nameLower.includes('toothpaste')) {
    return 'Personal Care';
  }
  
  if (nameLower.includes('biscuit') || nameLower.includes('snack') || nameLower.includes('chips')) {
    return 'Snacks & Chocolates';
  }
  
  if (nameLower.includes('pooja') || nameLower.includes('sambrani') || nameLower.includes('camphor')) {
    return 'Pooja Needs';
  }
  
  if (nameLower.includes('cleaner') || nameLower.includes('detergent') || nameLower.includes('bleach')) {
    return 'Household & Cleaning';
  }
  
  return 'Others';
}

function calculateDiscount(price: number, mrp?: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function splitProductsByCategory() {
  const inputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'master_product_database.json');
  const outputDir = path.join(__dirname, '..', 'prisma', 'seeds', 'categories');
  
  console.log('📦 Starting product categorization...\n');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: File not found at ${inputPath}`);
    process.exit(1);
  }
  
  let products: Product[] = [];
  try {
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    products = JSON.parse(fileContent);
    console.log(`✅ Loaded ${products.length} products from master file\n`);
  } catch (error) {
    console.error(`❌ Error reading file: ${error}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}\n`);
  }
  
  const categorizedProducts: { [key: string]: Product[] } = {};
  const stats: { [key: string]: number } = {};
  let redistributedCount = 0;
  let cleanedCount = 0;
  
  products.forEach((product, index) => {
    let category = product.category || 'Others';
    const mappedCategory = CATEGORY_MAPPING[category] || category;
    
    if (mappedCategory === 'REDISTRIBUTE') {
      category = redistributeOthersProduct(product);
      redistributedCount++;
    } else {
      category = mappedCategory;
    }
    
    const originalName = product.name;
    product.name = cleanProductName(product.name);
    if (originalName !== product.name) {
      cleanedCount++;
    }
    
    product.subCategory = detectSubcategory(product.name, category);
    
    if (!product.mrp) {
      product.mrp = Math.round(product.price * 1.1);
    }
    
    product.discount = calculateDiscount(product.price, product.mrp);
    
    if (!categorizedProducts[category]) {
      categorizedProducts[category] = [];
    }
    categorizedProducts[category].push(product);
    
    stats[category] = (stats[category] || 0) + 1;
  });
  
  const categoryOrder = [
    'Rice & Rice Products',
    'Dals, Pulses & Flours',
    'Cooking Oils & Ghee',
    'Spices & Masalas',
    'Beverages',
    'Snacks & Chocolates',
    'Dairy & Bakery',
    'Personal Care',
    'Household & Cleaning',
    'Pooja Needs',
    'Baby Care',
    'Biscuits & Cookies',
    'Atta, Flours & Mixes',
    'Health & Wellness',
    'Stationery & Others',
    'Others',
  ];
  
  const sortedCategories = Object.keys(categorizedProducts).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  sortedCategories.forEach((category, index) => {
    const products = categorizedProducts[category];
    const fileName = `${String(index + 1).padStart(2, '0')}_${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
    
    console.log(`✅ ${category.padEnd(30)} → ${String(products.length).padStart(4)} products → ${fileName}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Products Processed:    ${products.length}`);
  console.log(`Categories Created:          ${sortedCategories.length}`);
  console.log(`Products Redistributed:      ${redistributedCount}`);
  console.log(`Product Names Cleaned:       ${cleanedCount}`);
  console.log(`Output Directory:            ${outputDir}`);
  console.log('='.repeat(80));
  console.log('\n✨ Product categorization completed successfully!\n');
}

splitProductsByCategory();