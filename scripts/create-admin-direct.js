#!/usr/bin/env node

/**
 * Create Admin User Direct Script
 * 
 * This script creates an admin user directly using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL');
  console.log('SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminUser.email)
      .single();

    if (existingUser) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Password: admin123');
      console.log('\n🎯 You can log in to the admin dashboard at:');
      console.log('   http://localhost:3000/admin');
      return;
    }

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        email_verified: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating user:', createError);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminUser.password);
    console.log('\n🎯 You can now log in to the admin dashboard at:');
    console.log('   http://localhost:3000/admin');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
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

