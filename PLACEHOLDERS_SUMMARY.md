# Image Placeholders - Summary & Quick Reference

## ✅ What Was Created

Successfully generated **29 placeholder images** with proper naming conventions for the entire Morandi Lifestyle e-commerce website.

## 📁 Directory Structure Created

```
public/images/
├── banners/              # 5 hero/banner placeholders (1920×1080)
│   ├── hero-main.svg
│   ├── hero-sale.svg
│   ├── hero-new-arrival.svg
│   ├── hero-seasonal.svg
│   └── sustainability-banner.svg
│
├── categories/           # 6 category placeholders (800×800)
│   ├── category-maternity.svg
│   ├── category-baby.svg
│   ├── category-bedding.svg
│   ├── category-feeding.svg
│   ├── category-postpartum.svg
│   └── category-women.svg
│
├── products/             # 6 product placeholders (1000×1000)
│   ├── product-placeholder-1.svg
│   ├── product-placeholder-2.svg
│   ├── product-placeholder-3.svg
│   ├── product-placeholder-4.svg
│   ├── product-placeholder-5.svg
│   └── product-placeholder-6.svg
│
├── promos/               # 3 promotional banners (1200×400)
│   ├── promo-banner-1.svg
│   ├── promo-banner-2.svg
│   └── free-shipping-banner.svg
│
├── about/                # 3 about section images (1200×800)
│   ├── about-story.svg
│   ├── about-mission.svg
│   └── about-sustainability.svg
│
└── instagram/            # 6 Instagram feed images (600×600)
    ├── instagram-1.svg
    ├── instagram-2.svg
    ├── instagram-3.svg
    ├── instagram-4.svg
    ├── instagram-5.svg
    └── instagram-6.svg
```

## 🎨 Image Specifications by Category

| Category | Dimensions | Aspect Ratio | Format | Max Size |
|----------|------------|--------------|--------|----------|
| Hero/Banners | 1920×1080 | 16:9 | JPG | 500KB |
| Categories | 800×800 | 1:1 | JPG | 200KB |
| Products | 1000×1000 | 1:1 | JPG/PNG | 300KB |
| Promos | 1200×400 | 3:1 | JPG | 250KB |
| About | 1200×800 | 3:2 | JPG | 400KB |
| Instagram | 600×600 | 1:1 | JPG | 150KB |

## 🔄 How to Replace Placeholders

### Quick Steps:
1. **Prepare your image** at the exact dimensions listed above
2. **Optimize/compress** the image using tools like:
   - [TinyPNG](https://tinypng.com/)
   - [ImageOptim](https://imageoptim.com/)
   - [Squoosh](https://squoosh.app/)
3. **Save as JPG** with the exact same filename (replace `.svg` with `.jpg`)
4. **Place in the same directory** as the SVG placeholder
5. **Optional:** Delete the SVG placeholder

### Example:
```bash
# You have: public/images/banners/hero-main.svg
# Prepare your image: my-awesome-hero.jpg
# Resize to: 1920×1080
# Compress to: <500KB
# Rename to: hero-main.jpg
# Place at: public/images/banners/hero-main.jpg
# Done! ✅
```

## 📝 Naming Conventions

### Standard Images
```
{type}-{descriptor}.jpg

Examples:
- hero-main.jpg
- category-baby.jpg
- promo-banner-1.jpg
```

### Product Images (when uploading actual products)
```
product-{SKU}-{variant}.jpg

Examples:
- product-MAT001-main.jpg
- product-MAT001-alt1.jpg
- product-BABY002-main.jpg
```

## 🗺️ Where Each Image Is Used

### Homepage Components:
- **HeroSection** → `banners/hero-main.jpg`
- **CategorySection** → `categories/category-*.jpg`
- **SustainabilityBanner** → `banners/sustainability-banner.jpg`
- **InstagramFeed** → `instagram/instagram-*.jpg`

### Product Pages:
- **ProductGallery** → `products/product-*.jpg`

### About Page:
- **Story Section** → `about/about-story.jpg`
- **Mission Section** → `about/about-mission.jpg`
- **Sustainability Section** → `about/about-sustainability.jpg`

## 📚 Reference Documents

Three comprehensive documents were created:

1. **IMAGE_PLACEHOLDERS_REFERENCE.md** - Technical specifications and image details
2. **IMAGE_USAGE_MAP.md** - Complete mapping of where each image is used
3. **PLACEHOLDERS_SUMMARY.md** - This quick reference guide

## 🛠️ Scripts

**Generator Script:** `scripts/generate-placeholders.js`
- Run anytime to regenerate placeholders
- Usage: `node scripts/generate-placeholders.js`

## ✨ Next Steps

1. **Review the generated placeholders** by opening the website
2. **Replace SVG files** with actual JPG images as you get them
3. **Use the IMAGE_USAGE_MAP.md** to see exactly where each image appears
4. **Follow the naming conventions** strictly for consistency
5. **Optimize all images** before uploading

## 💡 Pro Tips

- **Keep the SVGs** until you have final images
- **Use descriptive alt text** for accessibility
- **Test on mobile** to ensure images look good on all devices
- **Monitor performance** using Next.js Image component
- **Consider WebP format** for even better compression
- **Batch process** images using ImageOptim or similar tools

## 🎯 Image Priority Order

Replace placeholders in this order for best results:

1. ✅ **Hero-main** (already done with banner1.jpg)
2. **Category images** (most visible after hero)
3. **Product placeholders** (for product showcase)
4. **About images** (for brand story)
5. **Promotional banners** (for marketing campaigns)
6. **Instagram feed** (for social proof)

---

## 📊 Current Status

| Category | Total | Replaced | Remaining |
|----------|-------|----------|-----------|
| Hero/Banners | 5 | 1 (hero-main) | 4 |
| Categories | 6 | 0 | 6 |
| Products | 6 | 0 | 6 |
| Promos | 3 | 0 | 3 |
| About | 3 | 0 | 3 |
| Instagram | 6 | 0 | 6 |
| **TOTAL** | **29** | **1** | **28** |

---

*Generated: October 1, 2025*
*Script: `scripts/generate-placeholders.js`*

