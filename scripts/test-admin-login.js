#!/usr/bin/env node

/**
 * Test Admin Login Script
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    const email = 'admin@morandi.com';
    const password = 'admin123';

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Name:', user.name);
    console.log('  - Role:', user.role);
    console.log('  - Has Password:', !!user.password);
    console.log('  - Email Verified:', user.emailVerified);
    console.log('  - Created:', user.createdAt);

    if (!user.password) {
      console.log('❌ No password set!');
      return;
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Password test:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('🔄 Resetting password...');
      const newHash = await bcrypt.hash(password, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      
      // Test again
      const isValidAfter = await bcrypt.compare(password, newHash);
      console.log('🔑 Password test after reset:', isValidAfter ? '✅ VALID' : '❌ INVALID');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
