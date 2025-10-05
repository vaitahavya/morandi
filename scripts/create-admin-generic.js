#!/usr/bin/env node

/**
 * Create Admin User Generic Script
 * 
 * This script creates an admin user directly using Prisma
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user directly...');
    
    const adminUser = {
      name: 'Admin User',
      email: 'admin@morandi.com',
      password: 'admin123'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email }
    });

    if (existingUser) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Password: admin123');
      console.log('\n🎯 You can log in to the admin dashboard at:');
      console.log('   http://localhost:3000/admin');
      return;
    }

    // Create admin user
    const newUser = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        email_verified: new Date(),
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', newUser.id);
    console.log('\n🎯 You can now log in to the admin dashboard at:');
    console.log('   http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();
