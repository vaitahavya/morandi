# Supabase Storage Setup Guide

## 🚀 Quick Setup

### 1. Create Storage Bucket

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (for public image access)
   - **File size limit**: 50MB (adjust as needed)
   - **Allowed MIME types**: `image/*`

### 2. Set Up Storage Policies

After creating the bucket, set up RLS policies:

#### Public Read Access
```sql
-- Allow public read access to all files
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

#### Authenticated Upload Access
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

#### Owner Update/Delete Access
```sql
-- Allow users to update/delete their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Test the Setup

You can test the storage setup using the helper functions:

```typescript
import { uploadImage } from '@/lib/image-upload';

// Example usage in a component
const handleImageUpload = async (file: File) => {
  const result = await uploadImage(file, 'products');
  
  if (result.success) {
    console.log('Image uploaded:', result.url);
    // Save URL to your database
  } else {
    console.error('Upload failed:', result.error);
  }
};
```

## 📁 Folder Structure

Recommended folder structure for your images:

```
product-images/
├── products/
│   ├── product-1/
│   │   ├── main.jpg
│   │   ├── gallery-1.jpg
│   │   └── gallery-2.jpg
│   └── product-2/
│       ├── main.jpg
│       └── gallery-1.jpg
├── users/
│   ├── avatars/
│   └── profiles/
└── banners/
    ├── hero-banner.jpg
    └── promo-banner.jpg
```

## 🔧 Integration with WooCommerce Sync

When syncing products from WooCommerce, you can:

1. **Download images** from WooCommerce URLs
2. **Upload to Supabase Storage**
3. **Update product records** with new URLs

Example implementation:

```typescript
// In your sync function
const syncProductImages = async (woocommerceProduct: any) => {
  const imageUrls = [];
  
  for (const image of woocommerceProduct.images) {
    // Download image from WooCommerce
    const response = await fetch(image.src);
    const blob = await response.blob();
    const file = new File([blob], `product-${woocommerceProduct.id}.jpg`, { type: 'image/jpeg' });
    
    // Upload to Supabase Storage
    const result = await uploadImage(file, 'products', `product-${woocommerceProduct.id}.jpg`);
    
    if (result.success) {
      imageUrls.push(result.url);
    }
  }
  
  return imageUrls;
};
```

## 💰 Pricing

Supabase Storage pricing:
- **Free tier**: 1GB storage, 2GB bandwidth
- **Pro plan**: $25/month for 100GB storage, 250GB bandwidth
- **Team plan**: $599/month for 2TB storage, 5TB bandwidth

## 🔒 Security Best Practices

1. **Validate file types** before upload
2. **Limit file sizes** to prevent abuse
3. **Use signed URLs** for sensitive content
4. **Implement rate limiting** for uploads
5. **Scan for malware** (consider using services like VirusTotal API)

## 🚀 Performance Tips

1. **Use CDN**: Supabase Storage includes CDN by default
2. **Optimize images**: Compress before upload
3. **Lazy loading**: Load images as needed
4. **Responsive images**: Serve different sizes for different devices
5. **Caching**: Set appropriate cache headers

## 📱 Usage Examples

### Upload Component
```typescript
import { uploadImage } from '@/lib/image-upload';

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadImage(file, 'products');
      if (result.success && result.url) {
        onUpload(result.url);
      }
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileChange}
    />
  );
}
```

### Display Component
```typescript
import { getOptimizedImageUrl } from '@/lib/image-upload';

export function ProductImage({ src, alt, width = 400, height = 400 }: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  const optimizedUrl = getOptimizedImageUrl(src, width, height);
  
  return (
    <img 
      src={optimizedUrl} 
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
```

## 🎯 Next Steps

1. **Set up the storage bucket** in your Supabase dashboard
2. **Apply the RLS policies** for security
3. **Test the upload functions** with sample images
4. **Integrate with your product sync** to store WooCommerce images
5. **Add image optimization** for better performance

Your images will be securely stored and served with CDN performance! 🚀 