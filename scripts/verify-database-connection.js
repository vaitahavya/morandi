#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * 
 * This script verifies the database connection using Prisma (the actual client used in the app)
 * and checks for products to help identify if you're connected to the correct database.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Helper to mask sensitive parts of connection string
function maskConnectionString(url) {
  if (!url) return 'NOT SET';
  
  try {
    const parsed = new URL(url.replace('postgresql://', 'http://'));
    const maskedPassword = parsed.password ? '*'.repeat(Math.min(parsed.password.length, 8)) : 'NO_PASSWORD';
    return `postgresql://${parsed.username}:${maskedPassword}@${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  } catch (e) {
    return 'INVALID_FORMAT';
  }
}

// Extract database host from connection string
function extractDatabaseInfo(url) {
  if (!url) return null;
  
  try {
    const parsed = new URL(url.replace('postgresql://', 'http://'));
    return {
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: parsed.pathname.slice(1) || 'postgres',
      user: parsed.username,
      hasPassword: !!parsed.password,
    };
  } catch (e) {
    return null;
  }
}

async function verifyDatabaseConnection() {
  console.log('\n🔍 Database Connection Verification\n');
  console.log('=' .repeat(60));
  
  // 1. Check environment variables
  console.log('\n📋 Environment Variables:');
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set!');
    console.error('   Please set DATABASE_URL in your .env.local file or Vercel environment variables.');
    process.exit(1);
  }
  
  console.log(`   DATABASE_URL: ${maskConnectionString(databaseUrl)}`);
  if (directUrl) {
    console.log(`   DIRECT_URL: ${maskConnectionString(directUrl)}`);
  } else {
    console.log(`   DIRECT_URL: Not set (optional, used for migrations)`);
  }
  
  const dbInfo = extractDatabaseInfo(databaseUrl);
  if (dbInfo) {
    console.log('\n📊 Connection Details:');
    console.log(`   Host: ${dbInfo.host}`);
    console.log(`   Port: ${dbInfo.port}`);
    console.log(`   Database: ${dbInfo.database}`);
    console.log(`   User: ${dbInfo.user}`);
    console.log(`   Password: ${dbInfo.hasPassword ? '✅ Set' : '❌ Not set'}`);
  }
  
  // 2. Test Prisma connection
  console.log('\n🔌 Testing Prisma Connection...');
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to database via Prisma!\n');
  } catch (error) {
    console.error('❌ Failed to connect to database');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('P1001')) {
      console.error('\n   → Cannot reach database server. Possible reasons:');
      console.error('      - Database server is down');
      console.error('      - Incorrect hostname or port');
      console.error('      - Firewall blocking connection');
      console.error('      - Network connectivity issues');
    } else if (error.message.includes('P1000')) {
      console.error('\n   → Authentication failed. Check:');
      console.error('      - Database username');
      console.error('      - Database password');
      console.error('      - User permissions');
    } else if (error.message.includes('P1003')) {
      console.error('\n   → Database does not exist. Check the database name in your connection string.');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
  
  // 3. Get database information
  console.log('📊 Database Information:');
  try {
    const dbVersion = await prisma.$queryRaw`SELECT version() as version`;
    const dbName = await prisma.$queryRaw`SELECT current_database() as name`;
    const dbUser = await prisma.$queryRaw`SELECT current_user as user`;
    
    console.log(`   PostgreSQL Version: ${dbVersion[0].version.split(',')[0]}`);
    console.log(`   Database Name: ${dbName[0].name}`);
    console.log(`   Current User: ${dbUser[0].user}`);
  } catch (error) {
    console.log(`   ⚠️  Could not retrieve database info: ${error.message}`);
  }
  
  // 4. Check if tables exist
  console.log('\n📋 Checking Database Tables...');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found in the database!');
      console.log('      This might be a fresh/empty database.');
    } else {
      console.log(`   ✅ Found ${tables.length} table(s):`);
      tables.slice(0, 15).forEach(table => {
        console.log(`      - ${table.table_name}`);
      });
      if (tables.length > 15) {
        console.log(`      ... and ${tables.length - 15} more`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Could not list tables: ${error.message}`);
  }
  
  // 5. Check products
  console.log('\n📦 Checking Products...');
  try {
    const productCount = await prisma.product.count();
    console.log(`   Total Products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          status: true,
          createdAt: true,
        },
      });
      
      console.log('\n   Recent Products (last 5):');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (SKU: ${product.sku || 'N/A'})`);
        console.log(`      Status: ${product.status} | Created: ${product.createdAt.toISOString().split('T')[0]}`);
      });
      
      // Check for dummy/sample products
      const sampleProductSlugs = [
        'modern-ceramic-vase',
        'minimalist-table-lamp',
        'velvet-throw-pillow-set',
        'scandinavian-coffee-table',
        'artisan-candle-collection',
      ];
      
      const sampleProductsFound = await prisma.product.findMany({
        where: {
          slug: {
            in: sampleProductSlugs,
          },
        },
        select: {
          name: true,
          slug: true,
        },
      });
      
      if (sampleProductsFound.length > 0) {
        console.log('\n   ⚠️  WARNING: Sample/dummy products detected!');
        console.log(`      Found ${sampleProductsFound.length} sample product(s):`);
        sampleProductsFound.forEach(p => {
          console.log(`      - ${p.name} (${p.slug})`);
        });
        console.log('\n   💡 This suggests you might be connected to a test/development database');
        console.log('      or the database was seeded with sample data.');
      } else {
        console.log('\n   ✅ No sample products detected (likely production data)');
      }
    } else {
      console.log('   ⚠️  No products found in the database.');
    }
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      console.log('   ⚠️  Products table does not exist. Run migrations first:');
      console.log('      npx prisma migrate deploy');
    } else {
      console.log(`   ⚠️  Error checking products: ${error.message}`);
    }
  }
  
  // 6. Check categories
  console.log('\n📁 Checking Categories...');
  try {
    const categoryCount = await prisma.category.count();
    console.log(`   Total Categories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const categories = await prisma.category.findMany({
        take: 5,
        orderBy: { displayOrder: 'asc' },
        select: {
          name: true,
          slug: true,
        },
      });
      
      console.log('   Categories:');
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Error checking categories: ${error.message}`);
  }
  
  // 7. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Database Connection Verification Complete!\n');
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (!databaseUrl.includes('supabase.co')) {
    console.log('   - Make sure DATABASE_URL points to your production Supabase database');
  }
  console.log('   - Verify this is the same database where you created your products');
  console.log('   - Check Vercel environment variables match this DATABASE_URL');
  console.log('   - If products are missing, check your Supabase dashboard');
  console.log('     to see which project contains your real data\n');
  
  await prisma.$disconnect();
}

// Run verification
verifyDatabaseConnection()
  .catch(async (error) => {
    console.error('\n❌ Verification failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });



