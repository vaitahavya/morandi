// Test PostgreSQL database connection
const { Client } = require('pg');

// Extract connection details from the connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:[YOUR_PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres';

console.log('\n=== Testing PostgreSQL Database Connection ===\n');
console.log('Host: db.oqcxpwdqzjrkpymretwo.supabase.co');
console.log('Port: 5432');
console.log('Database: postgres');
console.log('User: postgres');
console.log('');

// Parse connection string
let dbConfig;
try {
  const url = new URL(connectionString.replace('postgresql://', 'http://'));
  const password = url.password || '[YOUR_PASSWORD]';
  
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1) || 'postgres',
    user: url.username || 'postgres',
    password: password === '[YOUR_PASSWORD]' ? null : password,
    ssl: {
      rejectUnauthorized: false // Supabase requires SSL
    },
    connectionTimeoutMillis: 5000
  };
  
  console.log('Connection Config:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Password: ${dbConfig.password ? '***SET***' : '❌ NOT SET (using placeholder)'}`);
  console.log('');
  
} catch (error) {
  console.error('Error parsing connection string:', error.message);
  process.exit(1);
}

// Test connection
async function testConnection() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to database!\n');
    
    // Test query
    const result = await client.query('SELECT version(), current_database(), current_user, now()');
    console.log('Database Information:');
    console.log(`  PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);
    console.log(`  Current Database: ${result.rows[0].current_database}`);
    console.log(`  Current User: ${result.rows[0].current_user}`);
    console.log(`  Server Time: ${result.rows[0].now}`);
    console.log('');
    
    // Check if we can list tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 10
    `);
    
    console.log(`Tables in database (showing first 10):`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('  (No tables found)');
    }
    console.log('');
    
    console.log('✅ Database connection test PASSED');
    
  } catch (error) {
    console.error('❌ Database connection test FAILED');
    console.error('\nError details:');
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Message: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n  → DNS resolution failed. Check if the hostname is correct.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n  → Connection timeout/refused. Check:');
      console.error('     - Is the database server running?');
      console.error('     - Is the hostname and port correct?');
      console.error('     - Are firewall rules blocking the connection?');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n  → Authentication failed. Check:');
      console.error('     - Is the password correct?');
      console.error('     - Is the username correct?');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n  → Database does not exist. Check the database name.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check if pg module is available
try {
  require('pg');
  testConnection();
} catch (error) {
  console.error('❌ pg module not found. Installing...\n');
  console.error('Please run: npm install pg');
  console.error('Or use: npx pg-test-connection');
  process.exit(1);
}





