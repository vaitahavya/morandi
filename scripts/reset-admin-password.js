#!/usr/bin/env node

/**
 * Reset Admin Password Script
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    const adminEmail = 'admin@morandi.com';
    const newPassword = 'admin123';

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
        }
      });
      
      console.log('✅ Admin user created!');
      console.log('📧 Email:', adminEmail);
      console.log('⚠️  Password has been set – store it securely and do not share');
      console.log('🆔 User ID:', newUser.id);
    } else {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
        }
      });

      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 New Password:', newPassword);
      console.log('🆔 User ID:', user.id);
      
      // Verify the password works
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log('✔️  Password verification:', isValid ? 'PASSED' : 'FAILED');
    }
    
    console.log('\n🎯 You can now log in at:');
    console.log('   http://localhost:3000/auth/signin');
    console.log('   or http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetAdminPassword();

