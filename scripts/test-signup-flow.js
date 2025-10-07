const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSignupFlow() {
  try {
    console.log('🧪 Testing signup flow...\n');
    
    // Test 1: Check recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log('📊 Recent users:');
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });
    
    // Test 2: Check email notifications
    const notifications = await prisma.emailNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log('\n📧 Recent email notifications:');
    notifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.type} - ${notification.subject} - Sent: ${notification.sent}`);
    });
    
    // Test 3: Test user count
    const userCount = await prisma.user.count();
    console.log(`\n👥 Total users in database: ${userCount}`);
    
    console.log('\n✅ Signup flow test completed!');
    console.log('\n🌐 Test the signup flow:');
    console.log('   1. Visit: http://localhost:3000/auth/signup');
    console.log('   2. Fill out the form');
    console.log('   3. Should redirect to: http://localhost:3000/auth/signup-success');
    console.log('   4. Then click "Sign In to Your Account"');
    
  } catch (error) {
    console.error('❌ Error testing signup flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignupFlow();
