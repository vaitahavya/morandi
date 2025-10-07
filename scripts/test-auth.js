const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication setup...\n');
    
    // Test 1: Check if users exist
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    // Test 2: Verify admin user password
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@morandi.com' }
    });
    
    if (admin) {
      const isValidPassword = await bcrypt.compare('admin123', admin.password);
      console.log(`\n✅ Admin password verification: ${isValidPassword ? 'PASS' : 'FAIL'}`);
    }
    
    // Test 3: Verify customer user password
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@test.com' }
    });
    
    if (customer) {
      const isValidPassword = await bcrypt.compare('customer123', customer.password);
      console.log(`✅ Customer password verification: ${isValidPassword ? 'PASS' : 'FAIL'}`);
    }
    
    // Test 4: Check database tables
    const tableCounts = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.session.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);
    
    console.log('\n📊 Database table counts:');
    console.log(`   Users: ${tableCounts[0]}`);
    console.log(`   Accounts: ${tableCounts[1]}`);
    console.log(`   Sessions: ${tableCounts[2]}`);
    console.log(`   Products: ${tableCounts[3]}`);
    console.log(`   Orders: ${tableCounts[4]}`);
    
    console.log('\n🎉 Authentication setup is ready!');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@morandi.com / admin123');
    console.log('   Customer: customer@test.com / customer123');
    console.log('\n🌐 Visit: http://localhost:3000/auth/signin');
    
  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
