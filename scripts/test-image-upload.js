/**
 * Test script for Supabase image upload functionality
 * Run with: node scripts/test-image-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testImageUpload() {
  try {
    console.log('🧪 Testing Supabase image upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    
    // Create a temporary test file
    const testFilePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testFilePath, testImageBuffer);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('folder', 'products');
    
    // Make request to upload API
    const response = await fetch('http://localhost:3000/api/upload-image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    if (result.success) {
      console.log('✅ Image upload successful!');
      console.log('📸 Image URL:', result.url);
      console.log('💬 Message:', result.message);
      
      // Test if the URL is accessible
      try {
        const imageResponse = await fetch(result.url);
        if (imageResponse.ok) {
          console.log('✅ Image is accessible via URL');
        } else {
          console.log('⚠️  Image URL returned status:', imageResponse.status);
        }
      } catch (error) {
        console.log('⚠️  Could not verify image accessibility:', error.message);
      }
    } else {
      console.log('❌ Image upload failed:');
      console.log('Error:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if we're running this script directly
if (require.main === module) {
  testImageUpload();
}

module.exports = { testImageUpload };
