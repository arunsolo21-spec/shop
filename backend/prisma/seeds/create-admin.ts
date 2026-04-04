import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@freshmart.com' },
    update: {},
    create: {
      email: 'admin@freshmart.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '9876543210',
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });