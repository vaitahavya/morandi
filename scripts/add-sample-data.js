#!/usr/bin/env node

/**
 * Add Sample Data Script
 * 
 * This script adds sample products and categories to test the native API and frontend
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

// Sample categories
const sampleCategories = [
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Beautiful home decoration items',
    isVisible: true,
    displayOrder: 1
  },
  {
    name: 'Lifestyle Accessories',
    slug: 'lifestyle-accessories',
    description: 'Trendy lifestyle accessories',
    isVisible: true,
    displayOrder: 2
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Modern furniture pieces',
    isVisible: true,
    displayOrder: 3
  },
  {
    name: 'Lighting',
    slug: 'lighting',
    description: 'Elegant lighting solutions',
    isVisible: true,
    displayOrder: 4
  }
];

// Sample products
const sampleProducts = [
  {
    name: 'Modern Ceramic Vase',
    slug: 'modern-ceramic-vase',
    description: 'A beautiful modern ceramic vase perfect for contemporary home decor. Handcrafted with attention to detail.',
    shortDescription: 'Beautiful modern ceramic vase for contemporary homes',
    sku: 'MCV-001',
    price: 2999,
    regularPrice: 3499,
    salePrice: 2999,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    stockQuantity: 25,
    stockStatus: 'instock',
    weight: 1.2,
    featured: true,
    status: 'published',
    category: 'Home Decor'
  },
  {
    name: 'Minimalist Table Lamp',
    slug: 'minimalist-table-lamp',
    description: 'Sleek minimalist table lamp with warm LED lighting. Perfect for bedside or desk use.',
    shortDescription: 'Sleek minimalist table lamp with warm LED lighting',
    sku: 'MTL-002',
    price: 4999,
    regularPrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    stockQuantity: 15,
    stockStatus: 'instock',
    weight: 2.1,
    featured: true,
    status: 'published',
    category: 'Lighting'
  },
  {
    name: 'Velvet Throw Pillow Set',
    slug: 'velvet-throw-pillow-set',
    description: 'Set of 2 luxury velvet throw pillows in rich emerald green. Adds elegance to any living space.',
    shortDescription: 'Set of 2 luxury velvet throw pillows',
    sku: 'VTP-003',
    price: 1999,
    regularPrice: 2499,
    salePrice: 1999,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    stockQuantity: 30,
    stockStatus: 'instock',
    weight: 0.8,
    featured: false,
    status: 'published',
    category: 'Home Decor'
  },
  {
    name: 'Scandinavian Coffee Table',
    slug: 'scandinavian-coffee-table',
    description: 'Beautiful Scandinavian-style coffee table made from sustainable oak wood. Clean lines and minimalist design.',
    shortDescription: 'Scandinavian-style coffee table in sustainable oak',
    sku: 'SCT-004',
    price: 12999,
    regularPrice: 12999,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    stockQuantity: 8,
    stockStatus: 'instock',
    weight: 25.5,
    featured: true,
    status: 'published',
    category: 'Furniture'
  },
  {
    name: 'Artisan Candle Collection',
    slug: 'artisan-candle-collection',
    description: 'Hand-poured artisan candles with natural soy wax and essential oils. Set of 3 different scents.',
    shortDescription: 'Hand-poured artisan candles, set of 3',
    sku: 'ACC-005',
    price: 1599,
    regularPrice: 1899,
    salePrice: 1599,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    stockQuantity: 20,
    stockStatus: 'instock',
    weight: 1.5,
    featured: false,
    status: 'published',
    category: 'Lifestyle Accessories'
  },
  {
    name: 'Geometric Wall Art Set',
    slug: 'geometric-wall-art-set',
    description: 'Modern geometric wall art set of 3 pieces. Perfect for creating a contemporary gallery wall.',
    shortDescription: 'Modern geometric wall art set of 3 pieces',
    sku: 'GWA-006',
    price: 3999,
    regularPrice: 4999,
    salePrice: 3999,
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500',
    stockQuantity: 12,
    stockStatus: 'instock',
    weight: 2.0,
    featured: false,
    status: 'published',
    category: 'Home Decor'
  },
  {
    name: 'Brass Pendant Light',
    slug: 'brass-pendant-light',
    description: 'Elegant brass pendant light with warm ambient lighting. Perfect for dining areas or kitchen islands.',
    shortDescription: 'Elegant brass pendant light with warm ambient lighting',
    sku: 'BPL-007',
    price: 8999,
    regularPrice: 8999,
    images: [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500',
    stockQuantity: 6,
    stockStatus: 'instock',
    weight: 3.2,
    featured: true,
    status: 'published',
    category: 'Lighting'
  },
  {
    name: 'Woven Storage Basket',
    slug: 'woven-storage-basket',
    description: 'Handwoven storage basket made from natural rattan. Perfect for organizing and adding texture to your space.',
    shortDescription: 'Handwoven storage basket in natural rattan',
    sku: 'WSB-008',
    price: 2499,
    regularPrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500'
    ],
    featuredImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500',
    stockQuantity: 18,
    stockStatus: 'instock',
    weight: 1.8,
    featured: false,
    status: 'published',
    category: 'Lifestyle Accessories'
  }
];

async function createCategories() {
  console.log('\n📁 Creating sample categories...');
  
  for (const category of sampleCategories) {
    try {
      const response = await nativeApi.post('/api/categories', category);
      
      if (response.data.success) {
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.error(`❌ Failed to create category ${category.name}:`, response.data.error);
      }
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error.message);
    }
  }
}

async function createProducts() {
  console.log('\n📦 Creating sample products...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const product of sampleProducts) {
    try {
      const response = await nativeApi.post('/api/products', product);
      
      if (response.data.success) {
        successCount++;
        console.log(`✅ Created product: ${product.name}`);
      } else {
        errorCount++;
        console.error(`❌ Failed to create product ${product.name}:`, response.data.error);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating product ${product.name}:`, error.message);
      if (error.response?.data) {
        console.error('Response:', error.response.data);
      }
    }
  }

  return { successCount, errorCount };
}

async function verifyData() {
  console.log('\n🔍 Verifying created data...');
  
  try {
    const productsResponse = await nativeApi.get('/api/products');
    const categoriesResponse = await nativeApi.get('/api/categories');
    
    if (productsResponse.data.success && categoriesResponse.data.success) {
      console.log(`✅ Data verification successful:`);
      console.log(`   📦 Products: ${productsResponse.data.data.length}`);
      console.log(`   📁 Categories: ${categoriesResponse.data.data.length}`);
    } else {
      console.error('❌ Data verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
  }
}

async function addSampleData() {
  try {
    console.log('🚀 Adding sample data to database...');
    
    // Create categories first
    await createCategories();
    
    // Wait a moment for categories to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create products
    const results = await createProducts();
    
    // Verify the data
    await verifyData();
    
    console.log('\n🎉 Sample data creation complete!');
    console.log(`   ✅ Products created: ${results.successCount}`);
    console.log(`   ❌ Products failed: ${results.errorCount}`);
    console.log(`   📁 Categories created: ${sampleCategories.length}`);
    
    console.log('\n🌐 You can now visit http://localhost:3000 to see the products!');
    
  } catch (error) {
    console.error('\n💥 Failed to add sample data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addSampleData().catch(error => {
    console.error('Sample data creation error:', error);
    process.exit(1);
  });
}

module.exports = { addSampleData, sampleProducts, sampleCategories };