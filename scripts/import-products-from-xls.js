const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Script to import products from XLS file to Supabase
 * Usage: node scripts/import-products-from-xls.js <path-to-xls-file>
 */

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to validate product data
function validateProductData(row, rowIndex) {
  const errors = [];
  
  if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
    errors.push(`Row ${rowIndex + 1}: Product name is required`);
  }
  
  if (!row.price || isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0) {
    errors.push(`Row ${rowIndex + 1}: Valid price is required`);
  }
  
  if (row.sku && typeof row.sku !== 'string') {
    errors.push(`Row ${rowIndex + 1}: SKU must be a string`);
  }
  
  if (row.stock_quantity && (isNaN(parseInt(row.stock_quantity)) || parseInt(row.stock_quantity) < 0)) {
    errors.push(`Row ${rowIndex + 1}: Stock quantity must be a valid number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to process images string
function processImages(imagesString) {
  if (!imagesString) return [];
  
  return imagesString
    .split(',')
    .map(img => img.trim())
    .filter(img => img.length > 0);
}

// Helper function to process tags string
function processTags(tagsString) {
  if (!tagsString) return [];
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

// Function to read and parse XLS file
function parseXLSFile(filePath) {
  try {
    console.log(`Reading XLS file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    });
    
    if (jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }
    
    // Get headers (first row)
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    console.log(`Found ${dataRows.length} data rows`);
    console.log('Headers:', headers);
    
    // Map headers to row data
    const products = dataRows.map((row, index) => {
      const product = {};
      headers.forEach((header, headerIndex) => {
        const value = row[headerIndex];
        // Convert header to snake_case for database compatibility
        const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        product[key] = value;
      });
      return product;
    });
    
    return products;
    
  } catch (error) {
    console.error('Error parsing XLS file:', error.message);
    throw error;
  }
}

// Function to generate SQL insert statements
function generateSQLInserts(products) {
  const sqlStatements = [];
  const errors = [];
  const warnings = [];
  
  console.log('\nProcessing products...');
  
  for (let i = 0; i < products.length; i++) {
    const productData = products[i];
    const rowIndex = i + 2; // +2 because we start from row 2 (after header)
    
    try {
      // Validate product data
      const validation = validateProductData(productData, rowIndex);
      if (!validation.isValid) {
        errors.push(...validation.errors);
        console.log(`❌ Row ${rowIndex}: ${validation.errors.join(', ')}`);
        continue;
      }
      
      // Generate slug
      const slug = generateSlug(productData.name);
      
      // Prepare product data for insertion
      const productToInsert = {
        name: productData.name.trim(),
        slug: slug,
        description: productData.description?.trim() || null,
        short_description: productData.short_description?.trim() || null,
        sku: productData.sku?.trim() || null,
        price: parseFloat(productData.price),
        regular_price: productData.regular_price ? parseFloat(productData.regular_price) : null,
        sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
        images: processImages(productData.images),
        featured_image: productData.featured_image?.trim() || null,
        stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
        stock_status: productData.stock_status || 'instock',
        manage_stock: productData.manage_stock !== false, // Default to true
        low_stock_threshold: productData.low_stock_threshold ? parseInt(productData.low_stock_threshold) : 5,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        status: productData.status || 'published',
        featured: productData.featured === true || productData.featured === 'true',
        meta_title: productData.meta_title?.trim() || null,
        meta_description: productData.meta_description?.trim() || null,
        tags: processTags(productData.tags),
        in_stock: productData.stock_quantity ? parseInt(productData.stock_quantity) > 0 : true,
        // Legacy category field - use 'Uncategorized' as default
        category: productData.category?.trim() || 'Uncategorized'
      };
      
      // Generate SQL insert statement
      const columns = Object.keys(productToInsert).join(', ');
      const values = Object.values(productToInsert).map(value => {
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (Array.isArray(value)) {
          // Convert array to PostgreSQL array format
          const arrayString = value.map(item => `"${item.replace(/"/g, '\\"')}"`).join(',');
          return `'{${arrayString}}'`;
        }
        return value;
      }).join(', ');
      
      const sql = `INSERT INTO products (${columns}) VALUES (${values});`;
      sqlStatements.push(sql);
      
      console.log(`✅ Row ${rowIndex}: ${productData.name} - Ready for import`);
      
    } catch (error) {
      errors.push(`Row ${rowIndex}: Unexpected error - ${error.message}`);
      console.log(`❌ Row ${rowIndex}: ${error.message}`);
    }
  }
  
  return {
    sqlStatements,
    errors,
    warnings,
    totalProcessed: products.length,
    validProducts: sqlStatements.length
  };
}

// Function to save SQL to file
function saveSQLToFile(sqlStatements, outputPath) {
  const sqlContent = [
    '-- Product Import SQL Statements',
    '-- Generated from XLS file import',
    `-- Generated at: ${new Date().toISOString()}`,
    '',
    '-- Begin transaction',
    'BEGIN;',
    '',
    ...sqlStatements,
    '',
    '-- Commit transaction',
    'COMMIT;'
  ].join('\n');
  
  fs.writeFileSync(outputPath, sqlContent);
  console.log(`\nSQL statements saved to: ${outputPath}`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/import-products-from-xls.js <path-to-xls-file> [output-sql-file]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/import-products-from-xls.js products.xlsx');
    console.log('  node scripts/import-products-from-xls.js products.xlsx output.sql');
    process.exit(1);
  }
  
  const xlsFilePath = args[0];
  const outputSqlFile = args[1] || 'product-import.sql';
  
  try {
    console.log('🚀 Starting XLS to Supabase import process...\n');
    
    // Parse XLS file
    const products = parseXLSFile(xlsFilePath);
    
    // Generate SQL statements
    const result = generateSQLInserts(products);
    
    // Save SQL to file
    saveSQLToFile(result.sqlStatements, outputSqlFile);
    
    // Print summary
    console.log('\n📊 Import Summary:');
    console.log(`Total rows processed: ${result.totalProcessed}`);
    console.log(`Valid products: ${result.validProducts}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n✅ Process completed!');
    console.log(`📁 SQL file saved as: ${outputSqlFile}`);
    console.log('\nNext steps:');
    console.log('1. Review the generated SQL file');
    console.log('2. Execute the SQL in your Supabase SQL editor');
    console.log('3. Or use the MCP Supabase tools to execute the statements');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  parseXLSFile,
  generateSQLInserts,
  generateSlug,
  validateProductData
};
