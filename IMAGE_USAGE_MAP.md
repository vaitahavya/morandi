# Image Usage Map - Morandi Lifestyle Website

This document maps where each image is used across the website and provides proper naming conventions.

## 🎯 Image Directory Structure

```
public/images/
├── banners/              # Hero banners and main promotional images (1920×1080)
├── categories/           # Category showcase images (800×800)
├── products/             # Product images (1000×1000)
├── promos/               # Promotional banners (1200×400)
├── about/                # About/Story section images (1200×800)
└── instagram/            # Instagram feed images (600×600)
```

---

## 📍 Image Usage by Component

### Hero Section (Homepage)
**Component:** `src/components/landing/HeroSection.tsx`

| Image Name | Path | Current Usage |
|------------|------|---------------|
| hero-main.jpg | `/images/banners/hero-main.jpg` | Main homepage hero banner |

**Fallbacks:**
- `hero-main.svg` (placeholder)

---

### Hero Images Configuration
**File:** `src/lib/hero-images.ts`

| Image ID | File Name | Path | Purpose |
|----------|-----------|------|---------|
| hero-main | hero-main.jpg | `/images/banners/hero-main.jpg` | Main homepage hero |
| hero-sale | hero-sale.jpg | `/images/banners/hero-sale.jpg` | Sale/promotional hero |
| hero-new-arrival | hero-new-arrival.jpg | `/images/banners/hero-new-arrival.jpg` | New arrivals hero |
| hero-seasonal | hero-seasonal.jpg | `/images/banners/hero-seasonal.jpg` | Seasonal campaigns |

---

### Category Section
**Component:** `src/components/landing/CategorySection.tsx`

| Category Name | Recommended Image | Path |
|---------------|-------------------|------|
| Baby Products | category-baby.jpg | `/images/categories/category-baby.jpg` |
| Home Bedding | category-bedding.jpg | `/images/categories/category-bedding.jpg` |
| Feeding Aprons | category-feeding.jpg | `/images/categories/category-feeding.jpg` |
| Maternity Wear | category-maternity.jpg | `/images/categories/category-maternity.jpg` |
| Postpartum Wear | category-postpartum.jpg | `/images/categories/category-postpartum.jpg` |
| Women's Wear | category-women.jpg | `/images/categories/category-women.jpg` |

**Current Status:** All categories currently use `hero-main.jpg` as placeholder

---

### Sustainability Banner
**Component:** `src/components/landing/SustainabilityBanner.tsx`

| Image Name | Path | Usage |
|------------|------|-------|
| sustainability-banner.jpg | `/images/banners/sustainability-banner.jpg` | Background for sustainability section |

**Current Status:** Uses `hero-main.jpg` as placeholder

---

### Product Images
**Component:** `src/components/products/ProductGallery.tsx` and product cards

| Placeholder Name | Path | Usage |
|------------------|------|-------|
| product-placeholder-1.jpg | `/images/products/product-placeholder-1.jpg` | Generic product image 1 |
| product-placeholder-2.jpg | `/images/products/product-placeholder-2.jpg` | Generic product image 2 |
| product-placeholder-3.jpg | `/images/products/product-placeholder-3.jpg` | Generic product image 3 |
| product-placeholder-4.jpg | `/images/products/product-placeholder-4.jpg` | Generic product image 4 |
| product-placeholder-5.jpg | `/images/products/product-placeholder-5.jpg` | Generic product image 5 |
| product-placeholder-6.jpg | `/images/products/product-placeholder-6.jpg` | Generic product image 6 |

**Note:** Product images should be uploaded with SKU-based naming:
- Format: `product-{SKU}-{variant}.jpg`
- Example: `product-MAT001-main.jpg`, `product-MAT001-alt1.jpg`

---

### About Section
**Component:** `src/app/about/page.tsx`

| Image Name | Path | Usage |
|------------|------|-------|
| about-story.jpg | `/images/about/about-story.jpg` | Our story section |
| about-mission.jpg | `/images/about/about-mission.jpg` | Mission statement section |
| about-sustainability.jpg | `/images/about/about-sustainability.jpg` | Sustainability commitment section |

---

### Instagram Feed
**Component:** `src/components/landing/InstagramFeed.tsx`

| Image Name | Path | Usage |
|------------|------|-------|
| instagram-1.jpg | `/images/instagram/instagram-1.jpg` | Instagram post 1 |
| instagram-2.jpg | `/images/instagram/instagram-2.jpg` | Instagram post 2 |
| instagram-3.jpg | `/images/instagram/instagram-3.jpg` | Instagram post 3 |
| instagram-4.jpg | `/images/instagram/instagram-4.jpg` | Instagram post 4 |
| instagram-5.jpg | `/images/instagram/instagram-5.jpg` | Instagram post 5 |
| instagram-6.jpg | `/images/instagram/instagram-6.jpg` | Instagram post 6 |

---

### Promotional Banners

| Image Name | Path | Usage |
|------------|------|-------|
| promo-banner-1.jpg | `/images/promos/promo-banner-1.jpg` | Promotional banner 1 |
| promo-banner-2.jpg | `/images/promos/promo-banner-2.jpg` | Promotional banner 2 |
| free-shipping-banner.jpg | `/images/promos/free-shipping-banner.jpg` | Free shipping promotion |

---

## 🎨 Image Specifications by Type

### Hero Banners
- **Dimensions:** 1920×1080px (16:9 ratio)
- **Format:** JPG
- **Max Size:** 500KB
- **Quality:** 85%
- **Optimization:** Yes, compress for web

### Category Images
- **Dimensions:** 800×800px (1:1 ratio)
- **Format:** JPG
- **Max Size:** 200KB
- **Quality:** 85%
- **Optimization:** Yes, compress for web

### Product Images
- **Dimensions:** 1000×1000px (1:1 ratio)
- **Format:** JPG or PNG (if transparency needed)
- **Max Size:** 300KB
- **Quality:** 90%
- **Optimization:** Yes, compress for web
- **Background:** White or transparent

### Promotional Banners
- **Dimensions:** 1200×400px (3:1 ratio)
- **Format:** JPG
- **Max Size:** 250KB
- **Quality:** 85%
- **Optimization:** Yes, compress for web

### About/Story Images
- **Dimensions:** 1200×800px (3:2 ratio)
- **Format:** JPG
- **Max Size:** 400KB
- **Quality:** 90%
- **Optimization:** Yes, compress for web

### Instagram Feed Images
- **Dimensions:** 600×600px (1:1 ratio)
- **Format:** JPG
- **Max Size:** 150KB
- **Quality:** 85%
- **Optimization:** Yes, compress for web

---

## 🔄 Image Replacement Workflow

### For SVG Placeholders:
1. Prepare your image at the exact dimensions
2. Optimize using tools like TinyPNG, ImageOptim, or Squoosh
3. Rename to match the exact filename (replace .svg with .jpg)
4. Place in the correct directory
5. Delete the .svg placeholder (optional)

### For Real Product Images:
1. Use high-quality product photography
2. Ensure white or transparent background
3. Crop to square (1:1 aspect ratio)
4. Resize to 1000×1000px
5. Compress to under 300KB
6. Save with descriptive SKU-based name

---

## 📝 Naming Conventions

### Standard Images
- **Format:** `{type}-{descriptor}.{ext}`
- **Examples:** 
  - `hero-main.jpg`
  - `category-baby.jpg`
  - `promo-banner-1.jpg`

### Product Images
- **Format:** `product-{SKU}-{variant}.{ext}`
- **Examples:**
  - `product-MAT001-main.jpg`
  - `product-MAT001-alt1.jpg`
  - `product-BABY002-main.jpg`

### Category Images
- **Format:** `category-{category-name}.{ext}`
- **Examples:**
  - `category-maternity.jpg`
  - `category-baby.jpg`
  - `category-bedding.jpg`

---

## ✅ Image Upload Checklist

Before uploading any image:

- [ ] Image is at correct dimensions
- [ ] File is optimized/compressed
- [ ] File size is under recommended maximum
- [ ] Filename follows naming convention
- [ ] Image quality is acceptable
- [ ] Image is in correct directory
- [ ] Alt text is prepared for component

---

## 🚀 Next Steps

1. **Replace SVG placeholders** with actual images as you get them
2. **Update component imports** if needed (most are already configured)
3. **Test on different devices** to ensure images look good
4. **Monitor performance** - use Next.js Image component for optimization
5. **Consider WebP format** for even better compression

---

*Generated on: October 1, 2025*
*Last Updated: October 1, 2025*

