// Test script for image upload endpoint (Node.js version)
// Usage: node test-upload.js [your-dev-server-url]

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.png');

async function testUpload() {
  console.log('Testing image upload endpoint at:', `${BASE_URL}/api/upload-image`);
  console.log('');

  // Create a simple test image if it doesn't exist
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image...');
    // Create a minimal PNG (1x1 blue pixel)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(TEST_IMAGE_PATH, pngBuffer);
    console.log('Test image created:', TEST_IMAGE_PATH);
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('folder', 'products');

    console.log('Uploading test image...');
    console.log('');

    // Make request
    const response = await fetch(`${BASE_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    console.log('HTTP Status:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    console.log('');

    if (response.ok && responseData.success) {
      console.log('✅ Upload successful!');
      console.log('Image URL:', responseData.url);
    } else {
      console.log('❌ Upload failed');
      console.log('Error:', responseData.error || responseData.message);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUpload();





