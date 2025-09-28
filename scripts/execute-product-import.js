const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to execute the product import SQL using Supabase CLI
 * This will import all products from the generated SQL file
 */

function executeSQLFile(sqlFilePath) {
  try {
    console.log('🚀 Starting product import to Supabase...\n');
    
    // Check if SQL file exists
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }
    
    console.log(`📁 Reading SQL file: ${sqlFilePath}`);
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into individual statements (remove BEGIN/COMMIT for individual execution)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT');
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use psql to execute the statement
        const command = `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "${statement.replace(/"/g, '\\"')}"`;
        
        execSync(command, { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = `Statement ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }
    }
    
    // Print summary
    console.log('\n📊 Import Summary:');
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (successCount > 0) {
      console.log('\n✅ Product import completed successfully!');
      console.log(`📦 ${successCount} products imported to Supabase`);
    }
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Alternative method using Supabase CLI
function executeWithSupabaseCLI(sqlFilePath) {
  try {
    console.log('🚀 Starting product import using Supabase CLI...\n');
    
    // Check if SQL file exists
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }
    
    console.log(`📁 Executing SQL file: ${sqlFilePath}`);
    
    // Use Supabase CLI to execute the SQL file
    const command = `supabase db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" --file "${sqlFilePath}"`;
    
    execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
    console.log('\n✅ Product import completed successfully using Supabase CLI!');
    
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    console.log('\n💡 Trying alternative method...\n');
    
    // Fallback to direct psql execution
    executeSQLFile(sqlFilePath);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/execute-product-import.js [sql-file-path]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/execute-product-import.js product-import.sql');
    console.log('  node scripts/execute-product-import.js');
    console.log('');
    console.log('If no file is specified, it will use product-import.sql by default');
    process.exit(1);
  }
  
  const sqlFilePath = args[0] || 'product-import.sql';
  
  // Try Supabase CLI first, then fallback to direct psql
  executeWithSupabaseCLI(sqlFilePath);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  executeSQLFile,
  executeWithSupabaseCLI
};
