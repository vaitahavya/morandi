# Local Image Storage Setup

## 🚀 Quick Start

### 1. Directory Structure
```
public/
├── uploads/           # Main uploads directory
│   ├── products/      # Product images
│   ├── users/         # User avatars
│   ├── banners/       # Marketing banners
│   └── test/          # Test uploads
```

### 2. Features
- ✅ **File validation** (type, size)
- ✅ **Automatic directory creation**
- ✅ **Unique filename generation**
- ✅ **Drag & drop support**
- ✅ **Progress indicators**
- ✅ **Error handling**

### 3. Usage Examples

#### Basic Upload Component
```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';

function ProductForm() {
  const handleImageUpload = (url: string) => {
    console.log('Image uploaded:', url);
    // Save URL to your database
  };

  return (
    <ImageUpload 
      onUpload={handleImageUpload}
      folder="products"
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}
```

#### Drag & Drop Upload
```tsx
import { DragDropImageUpload } from '@/components/ui/ImageUpload';

function ProductGallery() {
  const handleUpload = (url: string) => {
    // Add to gallery
  };

  return (
    <DragDropImageUpload 
      onUpload={handleUpload}
      folder="products"
      accept="image/*"
    />
  );
}
```

#### API Usage
```typescript
// Upload via API
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'products');

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Upload URL:', result.url);
```

## 📁 File Organization

### Recommended Structure
```
public/uploads/
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
├── banners/
│   ├── hero-banner.jpg
│   └── promo-banner.jpg
└── temp/              # Temporary uploads
```

### URL Patterns
- **Product images**: `/uploads/products/product-id/image.jpg`
- **User avatars**: `/uploads/users/avatars/user-id.jpg`
- **Banners**: `/uploads/banners/banner-name.jpg`

## 🔧 Configuration

### File Size Limits
- **Default**: 5MB
- **Configurable**: Set `maxSize` prop in components
- **Server-side**: Validated in API route

### Supported Formats
- **JPEG/JPG**: `image/jpeg`, `image/jpg`
- **PNG**: `image/png`
- **WebP**: `image/webp`
- **GIF**: `image/gif`

### Security Features
- ✅ **File type validation**
- ✅ **File size limits**
- ✅ **Unique filename generation**
- ✅ **Directory traversal protection**
- ✅ **Error handling**

## 🚀 Integration with WooCommerce Sync

When syncing products from WooCommerce, you can:

1. **Download images** from WooCommerce URLs
2. **Upload to local storage**
3. **Update product records** with local URLs

```typescript
// Example: Sync WooCommerce images to local storage
const syncProductImages = async (woocommerceProduct: any) => {
  const imageUrls = [];
  
  for (const image of woocommerceProduct.images) {
    // Download image from WooCommerce
    const response = await fetch(image.src);
    const blob = await response.blob();
    const file = new File([blob], `product-${woocommerceProduct.id}.jpg`, { 
      type: 'image/jpeg' 
    });
    
    // Upload to local storage
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');
    
    const uploadResponse = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const result = await uploadResponse.json();
    if (result.success) {
      imageUrls.push(result.url);
    }
  }
  
  return imageUrls;
};
```

## 🔄 Migration to Supabase Storage

When ready to deploy, you can easily switch to Supabase Storage:

1. **Replace upload functions**:
   ```typescript
   // Change from:
   import { uploadImageLocal } from '@/lib/local-image-upload';
   
   // To:
   import { uploadImage } from '@/lib/image-upload';
   ```

2. **Update API routes**:
   ```typescript
   // Change from:
   const result = await uploadImageLocal(file, folder);
   
   // To:
   const result = await uploadImage(file, folder);
   ```

3. **Update components** (no changes needed - same interface)

## 🧪 Testing

### Test Page
Visit `/test-upload` to test the upload functionality:

- **Simple upload**: Click to select files
- **Drag & drop**: Drag files to upload area
- **Preview**: See uploaded images
- **Validation**: Test file size and type limits

### API Testing
```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload-image \
  -F "file=@/path/to/image.jpg" \
  -F "folder=test"
```

## 📊 Performance

### Local Storage Advantages
- ✅ **Fast uploads** (no network transfer)
- ✅ **No bandwidth limits**
- ✅ **No storage costs**
- ✅ **Instant access**

### Local Storage Limitations
- ❌ **No CDN** (slower for users)
- ❌ **No automatic optimization**
- ❌ **No backup/redundancy**
- ❌ **Not suitable for production**

## 🔒 Security Considerations

### Development Only
- ⚠️ **Not secure for production**
- ⚠️ **No access control**
- ⚠️ **Files stored on server**
- ⚠️ **No virus scanning**

### Best Practices
1. **Validate file types** ✅
2. **Limit file sizes** ✅
3. **Use unique filenames** ✅
4. **Sanitize filenames** ✅
5. **Monitor disk usage** ⚠️

## 🎯 Next Steps

1. **Test the upload functionality** at `/test-upload`
2. **Integrate with your forms** using the components
3. **Add to WooCommerce sync** to store images locally
4. **Plan migration** to Supabase Storage for production

Your local image storage is ready for development! 🚀 