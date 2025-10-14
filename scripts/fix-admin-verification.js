#!/usr/bin/env node

/**
 * Fix Admin Email Verification Script
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixAdminVerification() {
  try {
    console.log('🔐 Fixing admin email verification...');
    
    const email = 'admin@morandi.com';

    // Update user to ensure proper email verification
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        role: 'admin'
      }
    });

    console.log('✅ Admin user updated:');
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Email Verified:', user.emailVerified);
    console.log('  - Has Password:', !!user.password);

    // Test the user object structure
    console.log('\n📋 User object structure:');
    console.log('  - id:', typeof user.id, user.id);
    console.log('  - email:', typeof user.email, user.email);
    console.log('  - role:', typeof user.role, user.role);
    console.log('  - password exists:', !!user.password);
    console.log('  - emailVerified type:', typeof user.emailVerified);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminVerification();
