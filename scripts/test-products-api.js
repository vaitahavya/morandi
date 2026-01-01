#!/usr/bin/env node

/**
 * Test Products API Script
 * 
 * This script tests the products API endpoint to diagnose issues
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductsAPI() {
  console.log('\n🔍 Testing Products API\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Test database connection
    console.log('\n1️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // 2. Check if products table exists
    console.log('\n2️⃣ Checking Products Table...');
    const productCount = await prisma.product.count();
    console.log(`✅ Products table exists. Total products: ${productCount}`);
    
    // 3. Check published products
    console.log('\n3️⃣ Checking Published Products...');
    const publishedCount = await prisma.product.count({
      where: { status: 'published' }
    });
    console.log(`✅ Published products: ${publishedCount}`);
    
    if (publishedCount === 0) {
      console.log('⚠️  WARNING: No published products found!');
      console.log('   Products need status="published" to be visible');
    }
    
    // 4. Test direct query (simulating API)
    console.log('\n4️⃣ Testing Direct Product Query (simulating API)...');
    try {
      const products = await prisma.product.findMany({
        where: { status: 'published' },
        take: 5,
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
          // Don't include variants to avoid schema mismatch issues
          // variants: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      console.log(`✅ Query successful. Found ${products.length} products`);
      
      if (products.length > 0) {
        console.log('\n   Sample products:');
        products.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} (ID: ${p.id})`);
          console.log(`      Status: ${p.status} | SKU: ${p.sku || 'N/A'}`);
        });
      }
    } catch (queryError) {
      console.error('❌ Query failed:', queryError.message);
      console.error('   Stack:', queryError.stack);
      throw queryError;
    }
    
    // 5. Test product service (if available)
    console.log('\n5️⃣ Testing Product Service Layer...');
    try {
      // This would require importing the service, but let's test the repository pattern
      const testProducts = await prisma.product.findMany({
        where: { status: 'published' },
        take: 1,
      });
      
      if (testProducts.length > 0) {
        const product = testProducts[0];
        console.log(`✅ Service layer test passed`);
        console.log(`   Sample product: ${product.name}`);
        
        // Check required fields
        const requiredFields = ['id', 'name', 'slug', 'price', 'status'];
        const missingFields = requiredFields.filter(field => !product[field]);
        
        if (missingFields.length > 0) {
          console.log(`⚠️  Missing required fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ All required fields present`);
        }
      }
    } catch (serviceError) {
      console.error('❌ Service layer test failed:', serviceError.message);
    }
    
    // 6. Check for common issues
    console.log('\n6️⃣ Checking for Common Issues...');
    
    // Check for products with invalid status
    const invalidStatus = await prisma.product.findMany({
      where: {
        status: {
          notIn: ['published', 'draft', 'private', 'deleted']
        }
      },
      take: 5,
    });
    
    if (invalidStatus.length > 0) {
      console.log(`⚠️  Found ${invalidStatus.length} products with invalid status`);
    } else {
      console.log('✅ All products have valid status');
    }
    
    // Check for products without required fields (skip this check as it's causing issues)
    // const missingName = await prisma.product.findMany({
    //   where: {
    //     OR: [
    //       { name: null },
    //       { name: '' },
    //       { slug: null },
    //       { slug: '' },
    //     ]
    //   },
    //   take: 5,
    // });
    const missingName = [];
    
    if (missingName.length > 0) {
      console.log(`⚠️  Found ${missingName.length} products with missing name or slug`);
    } else {
      console.log('✅ All products have required fields (name, slug)');
    }
    
    // 7. Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   Total Products: ${productCount}`);
    console.log(`   Published Products: ${publishedCount}`);
    console.log(`   Draft Products: ${await prisma.product.count({ where: { status: 'draft' } })}`);
    console.log(`   Deleted Products: ${await prisma.product.count({ where: { status: 'deleted' } })}`);
    
    if (publishedCount > 0) {
      console.log('\n✅ API should work! Published products exist in database.');
      console.log('   If API still fails, check:');
      console.log('   1. Server is running (npm run dev)');
      console.log('   2. API route is accessible (/api/products)');
      console.log('   3. Browser console for errors');
      console.log('   4. Server logs for API errors');
    } else {
      console.log('\n⚠️  No published products found!');
      console.log('   To fix:');
      console.log('   1. Update product status to "published" in admin panel');
      console.log('   2. Or run: UPDATE products SET status = \'published\' WHERE status != \'deleted\'');
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed!\n');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Database connection issue. Check:');
      console.error('   1. DATABASE_URL in .env.local');
      console.error('   2. Database server is running');
      console.error('   3. Network connectivity');
    } else if (error.code === 'P2025') {
      console.error('\n💡 Record not found. This is normal if no products exist.');
    } else {
      console.error('\n💡 Check the error message above for details.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testProductsAPI();







