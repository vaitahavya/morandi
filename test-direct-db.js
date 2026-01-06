// Test the direct PostgreSQL connection string provided
const { Client } = require('pg');

// The connection string you provided
// Note: [YOUR_PASSWORD] needs to be replaced with actual password
const directConnectionString = 'postgresql://postgres:[YOUR_PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres';

console.log('\n=== Testing Direct Database Connection ===\n');
console.log('Connection String: postgresql://postgres:***@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres');
console.log('');

// Parse the connection string
const url = new URL(directConnectionString.replace('postgresql://', 'http://'));
const password = url.password;

if (password === '[YOUR_PASSWORD]' || !password) {
  console.log('❌ Password not provided in connection string');
  console.log('   The connection string contains [YOUR_PASSWORD] placeholder');
  console.log('   Please provide the actual password to test this connection');
  console.log('');
  console.log('To test, you can:');
  console.log('  1. Replace [YOUR_PASSWORD] with your actual Supabase database password');
  console.log('  2. Or check your Supabase dashboard for the connection string');
  console.log('  3. Or use the DATABASE_URL from your .env file (which uses pooler)');
  process.exit(1);
}

const dbConfig = {
  host: url.hostname,
  port: parseInt(url.port) || 5432,
  database: url.pathname.slice(1) || 'postgres',
  user: url.username || 'postgres',
  password: password,
  ssl: {
    rejectUnauthorized: false // Supabase requires SSL
  },
  connectionTimeoutMillis: 10000
};

console.log('Connection Details:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Password: ${'*'.repeat(password.length)}`);
console.log('');

async function testConnection() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Attempting to connect to direct database...');
    await client.connect();
    console.log('✅ Successfully connected!\n');
    
    const result = await client.query('SELECT version(), current_database(), current_user, now()');
    console.log('Database Status:');
    console.log(`  ✅ PostgreSQL is running`);
    console.log(`  Version: ${result.rows[0].version.split(',')[0]}`);
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  User: ${result.rows[0].current_user}`);
    console.log(`  Server Time: ${result.rows[0].now}`);
    
    await client.end();
    console.log('\n✅ Direct database connection test PASSED');
    
  } catch (error) {
    console.error('❌ Connection FAILED\n');
    console.error('Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n→ DNS resolution failed. Hostname might be incorrect.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n→ Cannot reach database server. Possible reasons:');
      console.error('   - Database server is down');
      console.error('   - Firewall blocking connection');
      console.error('   - Wrong hostname or port');
    } else if (error.message.includes('password')) {
      console.error('\n→ Authentication failed. Check password.');
    }
    
    process.exit(1);
  }
}

testConnection();











