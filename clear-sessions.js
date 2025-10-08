#!/usr/bin/env node

/**
 * Clear NextAuth sessions and cookies for local testing
 * Run this script to clear any cached authentication state
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing NextAuth sessions and cookies...');

// Clear browser cookies instructions
console.log('\n📋 Manual Steps Required:');
console.log('1. Open your browser developer tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Clear all cookies for localhost:3000');
console.log('4. Clear localStorage and sessionStorage');
console.log('5. Refresh the page');

// Clear any temporary session files if they exist
const tempFiles = [
  '.next-auth',
  'next-auth-session'
];

tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.rmSync(file, { recursive: true, force: true });
      console.log(`✅ Cleared ${file}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${file}: ${error.message}`);
    }
  }
});

console.log('\n🎯 Test URLs:');
console.log('• Sign In: http://localhost:3000/auth/signin');
console.log('• Admin Panel: http://localhost:3000/admin');
console.log('• Test Credentials: admin@morandi.com / admin123');

console.log('\n✨ Ready for testing!');
