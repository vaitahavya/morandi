#!/usr/bin/env node

/**
 * WooCommerce to Supabase Migration Script
 * 
 * This script migrates products, categories, and other data from WooCommerce to the native Supabase database.
 * It fetches data from the WooCommerce REST API and transforms it to match our native schema.
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configuration
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

const BASE_URL = 'http://localhost:3000'; // For native API calls

console.log('🚀 Starting WooCommerce to Supabase Migration');
console.log('WordPress API URL:', WORDPRESS_API_URL);
console.log('Has Consumer Key:', !!WC_CONSUMER_KEY);
console.log('Has Consumer Secret:', !!WC_CONSUMER_SECRET);

// WooCommerce API client
const wooCommerceApi = axios.create({
  baseURL: WORDPRESS_API_URL,
  timeout: 30000,
});

// Native API client
const nativeApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all products from WooCommerce
 */
async function fetchWooCommerceProducts(page = 1, perPage = 100) {
  try {
    console.log(`📦 Fetching WooCommerce products (page ${page})...`);
    
    const response = await wooCommerceApi.get('/wc/v3/products', {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
        page,
        per_page: perPage,
        status: 'publish'
      }
    });

    const products = response.data;
    const totalPages = parseInt(response.headers['x-wp-totalpages']) || 1;
    
    console.log(`✅ Fetched ${products.length} products from page ${page}/${totalPages}`);
    
    // If there are more pages, fetch them recursively
    if (page < totalPages) {
      const nextPageProducts = await fetchWooCommerceProducts(page + 1, perPage);
      return [...products, ...nextPageProducts];
    }
    
    return products;
  } catch (error) {
    console.error('❌ Error fetching WooCommerce products:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch all categories from WooCommerce
 */
async function fetchWooCommerceCategories() {
  try {
    console.log('📁 Fetching WooCommerce categories...');
    
    const response = await wooCommerceApi.get('/wc/v3/products/categories', {
      params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
        per_page: 100
      }
    });

    console.log(`✅ Fetched ${response.data.length} categories`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching WooCommerce categories:', error.message);
    throw error;
  }
}

/**
 * Transform WooCommerce product to native format
 */
function transformProduct(wooProduct) {
  // Extract image URLs from WooCommerce format
  const images = wooProduct.images.map(img => img.src).filter(Boolean);
  const featuredImage = images[0] || null;

  // Transform categories
  const categories = wooProduct.categories.map(cat => ({
    id: cat.id.toString(),
    name: cat.name,
    slug: cat.slug
  }));

  // Handle pricing
  const regularPrice = parseFloat(wooProduct.regular_price) || parseFloat(wooProduct.price) || 0;
  const salePrice = wooProduct.sale_price ? parseFloat(wooProduct.sale_price) : null;
  const effectivePrice = salePrice || regularPrice;

  // Transform to our native format
  return {
    name: wooProduct.name,
    slug: wooProduct.slug,
    description: wooProduct.description || '',
    shortDescription: wooProduct.short_description || '',
    sku: wooProduct.sku || null,
    price: effectivePrice,
    regularPrice: regularPrice,
    salePrice: salePrice,
    images: images,
    featuredImage: featuredImage,
    stockQuantity: parseInt(wooProduct.stock_quantity) || 0,
    stockStatus: wooProduct.stock_status === 'instock' ? 'instock' : 
                 wooProduct.stock_status === 'outofstock' ? 'outofstock' : 'instock',
    manageStock: wooProduct.manage_stock,
    lowStockThreshold: parseInt(wooProduct.low_stock_amount) || 5,
    weight: wooProduct.weight ? parseFloat(wooProduct.weight) : null,
    dimensions: wooProduct.dimensions ? {
      length: wooProduct.dimensions.length,
      width: wooProduct.dimensions.width,
      height: wooProduct.dimensions.height
    } : null,
    status: 'published',
    featured: wooProduct.featured || false,
    metaTitle: wooProduct.meta_data?.find(m => m.key === '_yoast_wpseo_title')?.value || null,
    metaDescription: wooProduct.meta_data?.find(m => m.key === '_yoast_wpseo_metadesc')?.value || null,
    // Legacy fields for compatibility
    category: categories[0]?.name || 'Uncategorized',
    tags: wooProduct.tags?.map(tag => tag.name) || []
  };
}

/**
 * Transform WooCommerce category to native format
 */
function transformCategory(wooCategory) {
  return {
    name: wooCategory.name,
    slug: wooCategory.slug,
    description: wooCategory.description || '',
    image: wooCategory.image?.src || null,
    parentId: wooCategory.parent ? wooCategory.parent.toString() : null,
    displayOrder: wooCategory.menu_order || 0,
    isVisible: true
  };
}

/**
 * Create categories in native API
 */
async function migrateCategories(wooCategories) {
  console.log('\n📁 Migrating Categories...');
  
  const createdCategories = new Map();
  
  // Sort categories so parent categories are created first
  const sortedCategories = wooCategories.sort((a, b) => {
    if (a.parent === 0 && b.parent !== 0) return -1;
    if (a.parent !== 0 && b.parent === 0) return 1;
    return 0;
  });

  for (const wooCategory of sortedCategories) {
    try {
      const transformedCategory = transformCategory(wooCategory);
      
      // If this category has a parent, use the mapped parent ID
      if (transformedCategory.parentId && createdCategories.has(transformedCategory.parentId)) {
        transformedCategory.parentId = createdCategories.get(transformedCategory.parentId);
      } else if (transformedCategory.parentId) {
        // Parent not found, make it a root category
        transformedCategory.parentId = null;
      }

      const response = await nativeApi.post('/api/categories', transformedCategory);
      
      if (response.data.success) {
        createdCategories.set(wooCategory.id.toString(), response.data.data.id);
        console.log(`✅ Created category: ${transformedCategory.name}`);
      } else {
        console.error(`❌ Failed to create category ${transformedCategory.name}:`, response.data.error);
      }
    } catch (error) {
      console.error(`❌ Error creating category ${wooCategory.name}:`, error.message);
      if (error.response?.data) {
        console.error('Response:', error.response.data);
      }
    }
  }
  
  return createdCategories;
}

/**
 * Create products in native API
 */
async function migrateProducts(wooProducts, categoryMap) {
  console.log('\n📦 Migrating Products...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const [index, wooProduct] of wooProducts.entries()) {
    try {
      const transformedProduct = transformProduct(wooProduct);
      
      console.log(`📦 [${index + 1}/${wooProducts.length}] Migrating: ${transformedProduct.name}`);
      
      const response = await nativeApi.post('/api/products', transformedProduct);
      
      if (response.data.success) {
        successCount++;
        console.log(`✅ Created product: ${transformedProduct.name}`);
        
        // TODO: Create product-category relationships
        // This would require additional API endpoints or direct database access
        
      } else {
        errorCount++;
        console.error(`❌ Failed to create product ${transformedProduct.name}:`, response.data.error);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating product ${wooProduct.name}:`, error.message);
      if (error.response?.data) {
        console.error('Response:', error.response.data);
      }
    }

    // Add a small delay to avoid overwhelming the API
    if ((index + 1) % 10 === 0) {
      console.log(`⏳ Processed ${index + 1} products, taking a short break...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { successCount, errorCount };
}

/**
 * Clean up existing data (optional)
 */
async function cleanupExistingData() {
  console.log('\n🧹 Cleaning up existing data...');
  
  try {
    // Delete in order to avoid foreign key constraints
    await prisma.productCategory.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.inventoryTransaction.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    
    console.log('✅ Existing data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up data:', error.message);
    throw error;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`✅ Migration complete:`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   📁 Categories: ${categoryCount}`);
    
    // Test the API
    const apiResponse = await nativeApi.get('/api/products?limit=5');
    if (apiResponse.data.success) {
      console.log(`🚀 Native API test successful - found ${apiResponse.data.data.length} products`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('\n🚀 Starting migration process...');
    
    // Check if we have valid API credentials
    if (!WORDPRESS_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      throw new Error('Missing WooCommerce API credentials. Please check your .env.local file.');
    }

    // Optional: Clean up existing data
    const shouldCleanup = process.argv.includes('--clean');
    if (shouldCleanup) {
      await cleanupExistingData();
    }

    // Step 1: Fetch data from WooCommerce
    const [wooProducts, wooCategories] = await Promise.all([
      fetchWooCommerceProducts(),
      fetchWooCommerceCategories()
    ]);

    console.log(`\n📊 Migration Summary:`);
    console.log(`   📦 Products to migrate: ${wooProducts.length}`);
    console.log(`   📁 Categories to migrate: ${wooCategories.length}`);

    // Step 2: Migrate categories first (products depend on them)
    const categoryMap = await migrateCategories(wooCategories);

    // Step 3: Migrate products
    const productResults = await migrateProducts(wooProducts, categoryMap);

    // Step 4: Verify migration
    await verifyMigration();

    console.log('\n🎉 Migration Summary:');
    console.log(`   ✅ Products migrated: ${productResults.successCount}`);
    console.log(`   ❌ Products failed: ${productResults.errorCount}`);
    console.log(`   📁 Categories migrated: ${categoryMap.size}`);

    if (productResults.errorCount > 0) {
      console.log('\n⚠️  Some products failed to migrate. Check the logs above for details.');
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  fetchWooCommerceProducts,
  fetchWooCommerceCategories,
  transformProduct,
  transformCategory
};