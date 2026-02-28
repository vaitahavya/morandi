#!/bin/bash

# Test script for image upload endpoint
# Usage: ./test-upload.sh [your-dev-server-url]

BASE_URL="${1:-http://localhost:3000}"
TEST_IMAGE="test-image.png"

echo "Testing image upload endpoint at: $BASE_URL/api/upload-image"
echo ""

# Create a test image if it doesn't exist
if [ ! -f "$TEST_IMAGE" ]; then
  echo "Creating test image..."
  # Create a simple 1x1 PNG using ImageMagick or convert
  if command -v convert &> /dev/null; then
    convert -size 100x100 xc:blue "$TEST_IMAGE"
  elif command -v magick &> /dev/null; then
    magick -size 100x100 xc:blue "$TEST_IMAGE"
  else
    echo "Error: ImageMagick not found. Please create a test image manually or install ImageMagick."
    exit 1
  fi
fi

echo "Uploading test image..."
echo ""

# Test upload with curl
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -F "file=@$TEST_IMAGE" \
  -F "folder=products" \
  "$BASE_URL/api/upload-image")

# Extract HTTP status and body
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Upload successful!"
else
  echo "❌ Upload failed with status $HTTP_STATUS"
fi












