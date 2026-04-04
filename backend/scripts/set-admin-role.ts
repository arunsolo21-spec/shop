import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin setup script...');

  const adminEmail = 'admin@freshmart.com';
  const adminPassword = 'Admin@123';
  const adminName = 'Super Admin';
  const adminPhone = '+91 9876543210';

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Found existing user: ${adminEmail}`);

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          name: adminName,
          phone: adminPhone,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('Admin credentials updated successfully');
    } else {
      console.log(`Creating new admin: ${adminEmail}`);

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          phone: adminPhone,
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log('New admin created successfully');
    }

    console.log('\n========================================');
    console.log('✅ ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ADMIN`);
    console.log(`Status:   Active`);
    console.log('========================================\n');

    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    console.log(`Total admin users in system: ${adminCount}`);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

main();