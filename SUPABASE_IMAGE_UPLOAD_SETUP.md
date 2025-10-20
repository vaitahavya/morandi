# Supabase Image Upload Setup

This document explains how the Supabase image upload functionality is configured for product images in the Morandi e-commerce application.

## Overview

The application now automatically uploads product images to a Supabase Storage bucket named "products" when creating or updating products. This provides:

- **Cloud storage** for product images
- **Automatic cleanup** when images are removed or products are deleted
- **Optimized URLs** with transformation support
- **Fallback to local storage** for non-product uploads

## Setup Requirements

### 1. Environment Variables

Ensure these environment variables are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 2. Supabase Storage Bucket

Create a storage bucket named "products" in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named "products"
4. Set the bucket to public (for public image access)
5. Configure appropriate RLS policies if needed

### 3. RLS Policies (Optional)

If you want to restrict access, you can set up Row Level Security policies:

```sql
-- Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

## How It Works

### Image Upload Flow

1. **Product Form**: When uploading images in the admin product form, images are sent to `/api/upload-image`
2. **Folder Detection**: The API checks if the folder is "products"
3. **Supabase Upload**: If folder is "products", images are uploaded to Supabase Storage
4. **Local Fallback**: Other folders continue to use local storage
5. **URL Return**: The API returns the public URL for the uploaded image

### Image Cleanup

The system automatically cleans up images when:

- **Product Updates**: Removed images are deleted from Supabase Storage
- **Product Deletion**: All product images are deleted from Supabase Storage
- **Manual Removal**: Images removed via the admin interface are cleaned up

### File Structure

```
src/
├── lib/
│   ├── supabase-image-upload.ts    # Supabase upload functions
│   ├── image-cleanup.ts            # Image cleanup utilities
│   └── supabase.ts                 # Supabase client configuration
├── app/api/
│   └── upload-image/
│       └── route.ts                # Upload API endpoint
└── components/admin/
    └── ProductForm.tsx             # Product form with image upload
```

## API Endpoints

### POST /api/upload-image

Uploads images to either Supabase Storage (for products) or local storage (for other folders).

**Request:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'products'); // Use 'products' for Supabase upload
formData.append('fileName', 'optional-custom-name.jpg');

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully to Supabase",
  "url": "https://your-project.supabase.co/storage/v1/object/public/products/1234567890-image.jpg"
}
```

## Testing

### Manual Testing

1. Start your development server: `bun dev`
2. Go to the admin panel and create/edit a product
3. Upload an image - it should be stored in Supabase Storage
4. Check your Supabase Storage dashboard to verify the image was uploaded

### Automated Testing

Run the test script:

```bash
node scripts/test-image-upload.js
```

This will:
- Create a test image
- Upload it to the products bucket
- Verify the upload was successful
- Clean up the test file

## Configuration Options

### File Validation

The system validates uploaded images:

- **Allowed types**: JPEG, PNG, WebP, GIF
- **Maximum size**: 10MB (configurable)
- **Automatic filename generation**: Timestamp-based naming

### Image Optimization

Supabase Storage supports URL-based transformations:

```javascript
// Get optimized image URL
const optimizedUrl = `${imageUrl}?width=400&height=400&quality=80&resize=cover`;
```

## Troubleshooting

### Common Issues

1. **Upload fails with 401/403 errors**
   - Check your Supabase environment variables
   - Verify the bucket exists and is public
   - Check RLS policies if enabled

2. **Images not accessible**
   - Ensure the bucket is set to public
   - Check the bucket name is exactly "products"
   - Verify the file was uploaded successfully

3. **Cleanup not working**
   - Check that images are Supabase Storage URLs
   - Verify the service role key has delete permissions
   - Check console logs for cleanup errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed information about uploads and cleanup operations.

## Migration from Local Storage

If you're migrating from local storage to Supabase:

1. **Backup existing images**: Download all images from `public/uploads/products/`
2. **Upload to Supabase**: Use the Supabase dashboard or API to upload existing images
3. **Update database**: Update product records with new Supabase URLs
4. **Test thoroughly**: Verify all images are accessible

## Security Considerations

- **Public bucket**: The products bucket is public for easy access
- **File validation**: Only image files are allowed
- **Size limits**: Large files are rejected
- **Cleanup**: Unused images are automatically removed
- **RLS policies**: Can be configured for additional security

## Performance

- **CDN**: Supabase Storage includes CDN for fast global access
- **Optimization**: URL-based transformations for different sizes
- **Cleanup**: Automatic cleanup prevents storage bloat
- **Caching**: Browser caching for improved performance
