// Comprehensive upload issue checker
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('\n=== Image Upload Issue Diagnostic ===\n');

// Check Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('1. Supabase Environment Variables:');
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? (supabaseUrl.includes('your-supabase') ? '❌ PLACEHOLDER' : '✅ SET') : '❌ NOT SET'}`);
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? (supabaseKey.includes('your-supabase') ? '❌ PLACEHOLDER' : '✅ SET') : '❌ NOT SET'}`);
console.log('');

// Check if Supabase would initialize
const isValidSupabaseUrl = supabaseUrl && 
  supabaseUrl !== 'your-supabase-url' && 
  !supabaseUrl.includes('your-supabase-url') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

const supabaseInitialized = isValidSupabaseUrl && supabaseKey && !supabaseKey.includes('your-supabase');

console.log('2. Supabase Client Status:');
console.log(`   Will initialize: ${supabaseInitialized ? '✅ YES' : '❌ NO'}`);
if (!supabaseInitialized) {
  console.log('   → This means image uploads will FAIL');
}
console.log('');

// Check bucket requirements
console.log('3. Supabase Storage Requirements:');
console.log('   Bucket name: "products" (must exist)');
console.log('   Bucket must be: PUBLIC');
console.log('   RLS policies: Must allow INSERT operations');
console.log('');

// Common issues
console.log('4. Most Common Issues:');
if (!supabaseInitialized) {
  console.log('   ❌ PRIMARY ISSUE: Supabase not configured');
  console.log('      → Set NEXT_PUBLIC_SUPABASE_URL in .env.local');
  console.log('      → Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  console.log('      → Restart dev server after adding variables');
}
console.log('   → Bucket "products" doesn\'t exist in Supabase Storage');
console.log('   → Bucket is private (should be public)');
console.log('   → RLS policies blocking uploads');
console.log('   → File too large (>10MB)');
console.log('   → Invalid file type (only JPEG, PNG, WebP, GIF)');
console.log('');

// Next steps
console.log('5. Next Steps:');
if (!supabaseInitialized) {
  console.log('   1. Get Supabase credentials from Vercel or Supabase dashboard');
  console.log('   2. Add to .env.local:');
  console.log('      NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"');
  console.log('      NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"');
  console.log('   3. Restart dev server');
  console.log('   4. Verify bucket "products" exists and is public');
} else {
  console.log('   ✅ Supabase is configured');
  console.log('   → Check Supabase dashboard for bucket and RLS policies');
  console.log('   → Check server logs for [UPLOAD-DIAGNOSTIC] messages');
}
console.log('');





