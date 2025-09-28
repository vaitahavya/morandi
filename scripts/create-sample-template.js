const XLSX = require('xlsx');

/**
 * Script to create a sample XLS template for product import
 */

// Sample data with all possible fields
const sampleData = [
  {
    name: 'Sample Product 1',
    description: 'This is a detailed description of the sample product. It can be multiple lines and should describe the product features, benefits, and specifications.',
    short_description: 'Short description for quick overview',
    sku: 'SAMPLE-001',
    price: 99.99,
    regular_price: 119.99,
    sale_price: 99.99,
    stock_quantity: 50,
    stock_status: 'instock',
    manage_stock: true,
    low_stock_threshold: 5,
    weight: 1.5,
    status: 'published',
    featured: true,
    category: 'Electronics',
    tags: 'electronics, gadgets, sample, featured',
    meta_title: 'Sample Product 1 - Best Electronics Store',
    meta_description: 'Buy the best sample product with great features and competitive pricing',
    images: 'https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg',
    featured_image: 'https://example.com/featured.jpg'
  },
  {
    name: 'Sample Product 2',
    description: 'Another sample product with different characteristics. This product demonstrates various field combinations.',
    short_description: 'Another short description',
    sku: 'SAMPLE-002',
    price: 149.99,
    regular_price: 149.99,
    sale_price: null,
    stock_quantity: 25,
    stock_status: 'instock',
    manage_stock: true,
    low_stock_threshold: 3,
    weight: 2.0,
    status: 'published',
    featured: false,
    category: 'Clothing',
    tags: 'clothing, fashion, sample, casual',
    meta_title: 'Sample Product 2 - Fashion Store',
    meta_description: 'Stylish sample product perfect for your wardrobe',
    images: 'https://example.com/clothing1.jpg,https://example.com/clothing2.jpg',
    featured_image: 'https://example.com/clothing-featured.jpg'
  },
  {
    name: 'Sample Product 3 - Out of Stock',
    description: 'This product demonstrates out of stock status and different pricing structure.',
    short_description: 'Out of stock sample',
    sku: 'SAMPLE-003',
    price: 79.99,
    regular_price: 99.99,
    sale_price: 79.99,
    stock_quantity: 0,
    stock_status: 'outofstock',
    manage_stock: true,
    low_stock_threshold: 5,
    weight: 0.8,
    status: 'published',
    featured: false,
    category: 'Accessories',
    tags: 'accessories, sample, sale',
    meta_title: 'Sample Product 3 - Accessories',
    meta_description: 'Great accessory at a discounted price',
    images: 'https://example.com/accessory1.jpg',
    featured_image: 'https://example.com/accessory-featured.jpg'
  }
];

// Create workbook
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

// Write the file
const outputPath = 'product-import-template.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Sample template created: ${outputPath}`);
console.log('\n📋 Template includes the following fields:');
console.log('- name (required): Product name');
console.log('- description: Detailed product description');
console.log('- short_description: Brief product description');
console.log('- sku: Product SKU (Stock Keeping Unit)');
console.log('- price (required): Current selling price');
console.log('- regular_price: Regular price before sale');
console.log('- sale_price: Sale price (if on sale)');
console.log('- stock_quantity: Available stock quantity');
console.log('- stock_status: instock, outofstock, onbackorder');
console.log('- manage_stock: true/false - whether to track stock');
console.log('- low_stock_threshold: Alert when stock falls below this number');
console.log('- weight: Product weight in kg');
console.log('- status: published, draft, private');
console.log('- featured: true/false - whether product is featured');
console.log('- category: Product category name');
console.log('- tags: Comma-separated tags');
console.log('- meta_title: SEO title');
console.log('- meta_description: SEO description');
console.log('- images: Comma-separated image URLs');
console.log('- featured_image: Main product image URL');
console.log('\n💡 Tips:');
console.log('- Only "name" and "price" are required fields');
console.log('- Use comma-separated values for images and tags');
console.log('- Categories will be created automatically if they don\'t exist');
console.log('- SKUs must be unique across all products');
console.log('- Product slugs are generated automatically from names');
