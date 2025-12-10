// Quick script to check Supabase configuration
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('\n=== Supabase Configuration Check ===\n');

console.log('NEXT_PUBLIC_SUPABASE_URL:');
if (supabaseUrl) {
  const isValid = supabaseUrl && 
    supabaseUrl !== 'your-supabase-url' && 
    !supabaseUrl.includes('your-supabase-url') &&
    (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));
  
  console.log(`  ✅ Set: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`  ✅ Valid format: ${isValid ? 'YES' : 'NO'}`);
  if (!isValid) {
    console.log(`  ⚠️  Warning: URL appears to be a placeholder or invalid`);
  }
} else {
  console.log('  ❌ NOT SET');
}

console.log('\nNEXT_PUBLIC_SUPABASE_ANON_KEY:');
if (supabaseAnonKey) {
  const isValid = supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your-supabase');
  console.log(`  ✅ Set: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log(`  ✅ Valid format: ${isValid ? 'YES' : 'NO'}`);
  if (!isValid) {
    console.log(`  ⚠️  Warning: Key appears to be a placeholder or invalid`);
  }
} else {
  console.log('  ❌ NOT SET');
}

console.log('\n=== Supabase Client Status ===\n');

const isValidSupabaseUrl = supabaseUrl && 
  supabaseUrl !== 'your-supabase-url' && 
  !supabaseUrl.includes('your-supabase-url') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

const supabaseInitialized = isValidSupabaseUrl && supabaseAnonKey;

if (supabaseInitialized) {
  console.log('✅ Supabase client will be initialized');
  console.log('✅ Image uploads will use Supabase Storage');
} else {
  console.log('❌ Supabase client will NOT be initialized');
  console.log('❌ Image uploads will FAIL (no fallback configured)');
  console.log('\n⚠️  To fix:');
  console.log('   1. Set NEXT_PUBLIC_SUPABASE_URL in .env or .env.local');
  console.log('   2. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env or .env.local');
  console.log('   3. Make sure values are NOT placeholders');
}

console.log('\n');




