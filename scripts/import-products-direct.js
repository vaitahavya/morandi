const { Client } = require('pg');
const fs = require('fs');

/**
 * Script to import products directly to Supabase using PostgreSQL client
 */

// Database connection configuration
const dbConfig = {
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
};

async function importProducts() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🚀 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected to database successfully\n');
    
    // Read the SQL file
    const sqlFilePath = 'product-import.sql';
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }
    
    console.log(`📁 Reading SQL file: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        stmt !== 'BEGIN' && 
        stmt !== 'COMMIT' &&
        stmt.toLowerCase().includes('insert into products')
      );
    
    console.log(`📊 Found ${statements.length} product insert statements\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Importing product ${i + 1}/${statements.length}...`);
        
        await client.query(statement);
        successCount++;
        
        if ((i + 1) % 50 === 0) {
          console.log(`✅ Imported ${i + 1} products so far...`);
        }
        
      } catch (error) {
        errorCount++;
        const errorMsg = `Product ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
        
        // Continue with next product even if one fails
        continue;
      }
    }
    
    // Print summary
    console.log('\n📊 Import Summary:');
    console.log(`Total products: ${statements.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }
    
    if (successCount > 0) {
      console.log('\n✅ Product import completed successfully!');
      console.log(`📦 ${successCount} products imported to Supabase`);
      
      // Verify the import
      console.log('\n🔍 Verifying import...');
      const result = await client.query('SELECT COUNT(*) as count FROM products');
      console.log(`📊 Total products in database: ${result.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  importProducts().catch(console.error);
}

module.exports = { importProducts };
