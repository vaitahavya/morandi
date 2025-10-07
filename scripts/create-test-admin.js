const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@morandi.com' },
      update: {
        password: hashedPassword,
        role: 'admin',
      },
      create: {
        email: 'admin@morandi.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Test admin user created/updated:');
    console.log('Email: admin@morandi.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('ID:', admin.id);
    
    // Create a test customer user
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customer = await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {
        password: customerPassword,
        role: 'customer',
      },
      create: {
        email: 'customer@test.com',
        name: 'Test Customer',
        password: customerPassword,
        role: 'customer',
        emailVerified: new Date(),
      },
    });

    console.log('\n✅ Test customer user created/updated:');
    console.log('Email: customer@test.com');
    console.log('Password: customer123');
    console.log('Role: customer');
    console.log('ID:', customer.id);
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
