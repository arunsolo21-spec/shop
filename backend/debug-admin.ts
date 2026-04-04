// backend/debug-admin.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debug() {
  console.log('🔍 === STARTING ADMIN DEBUG ===');
  
  try {
    // 1. Check Database Connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 2. Check if User Exists
    const email = 'admin@freshmart.com';
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isActive: true, password: true }
    });

    if (!user) {
      console.log('❌ User NOT found in database!');
      console.log('🔨 Creating admin user now...');
      
      const password = 'Admin@123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Super Admin',
          role: 'ADMIN',
          isActive: true,
          phone: '+91 9876543210'
        }
      });
      console.log('✅ User created:', newUser.email);
    } else {
      console.log('✅ User FOUND in database');
      console.log('   ID:', user.id);
      console.log('   Role:', user.role);
      console.log('   Active:', user.isActive);
      console.log('   Password Hash Start:', user.password.substring(0, 20) + '...');

      // 3. Force Update Password just in case
      console.log('🔨 Updating password to ensure match...');
      const password = 'Admin@123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated successfully');
    }

    console.log('🎉 === DEBUG COMPLETE ===');
    console.log('👉 NOW: Restart your backend (Ctrl+C, then npm run start:dev)');
    console.log('👉 THEN: Try logging in with admin@freshmart.com / Admin@123');

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('💡 Check your .env DATABASE_URL');
  } finally {
    await prisma.$disconnect();
  }
}

debug();