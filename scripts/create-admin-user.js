#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user for accessing the admin dashboard
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// Native API client
const nativeApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    const adminUser = {
      name: 'Admin User',
      email: 'admin@morandi.com',
      password: 'admin123' // You can change this password
    };

    const response = await nativeApi.post('/api/auth/register', adminUser);
    
    if (response.status === 201) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Password:', adminUser.password);
      console.log('\n🎯 You can now log in to the admin dashboard at:');
      console.log('   http://localhost:3000/admin');
      console.log('\n📝 Login credentials:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${adminUser.password}`);
    } else {
      console.error('❌ Failed to create admin user:', response.data);
    }
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error === 'User already exists') {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email: admin@morandi.com');
      console.log('🔑 Password: admin123 (or whatever you set previously)');
      console.log('\n🎯 You can log in to the admin dashboard at:');
      console.log('   http://localhost:3000/admin');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data || error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser().catch(error => {
    console.error('Admin user creation error:', error);
    process.exit(1);
  });
}

module.exports = { createAdminUser };
