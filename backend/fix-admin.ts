import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@freshmart.com';
  const password = 'Admin@123';
  
  console.log('🔐 Fixing admin user...');
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Upsert: create if not exists, update if exists
  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      name: 'Super Admin',
      phone: '+91 9876543210',
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      name: 'Super Admin',
      phone: '+91 9876543210',
    },
  });
  
  console.log('✅ Admin user fixed!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);