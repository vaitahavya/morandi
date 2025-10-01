# Image Placeholders Reference

This document lists all placeholder images generated for the Morandi Lifestyle e-commerce website.

## 📁 Directory Structure

```
public/images/
├── banners/         # Hero banners and main promotional images
├── categories/      # Category showcase images
├── products/        # Product placeholder images
├── promos/          # Promotional banners
├── about/           # About/Story section images
└── instagram/       # Instagram feed images
```

## 🎨 Image Specifications


### Banners

**Location:** `banners/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| hero-main.jpg | 1920×1080 | MAIN HERO |
| hero-sale.jpg | 1920×1080 | SALE BANNER |
| hero-new-arrival.jpg | 1920×1080 | NEW ARRIVALS |
| hero-seasonal.jpg | 1920×1080 | SEASONAL |
| sustainability-banner.jpg | 1920×1080 | SUSTAINABILITY |

### Categories

**Location:** `categories/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| category-maternity.jpg | 800×800 | MATERNITY WEAR |
| category-baby.jpg | 800×800 | BABY PRODUCTS |
| category-bedding.jpg | 800×800 | HOME BEDDING |
| category-feeding.jpg | 800×800 | FEEDING APRONS |
| category-postpartum.jpg | 800×800 | POSTPARTUM WEAR |
| category-women.jpg | 800×800 | WOMEN'S WEAR |

### Products

**Location:** `products/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| product-placeholder-1.jpg | 1000×1000 | PRODUCT 1 |
| product-placeholder-2.jpg | 1000×1000 | PRODUCT 2 |
| product-placeholder-3.jpg | 1000×1000 | PRODUCT 3 |
| product-placeholder-4.jpg | 1000×1000 | PRODUCT 4 |
| product-placeholder-5.jpg | 1000×1000 | PRODUCT 5 |
| product-placeholder-6.jpg | 1000×1000 | PRODUCT 6 |

### Promos

**Location:** `promos/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| promo-banner-1.jpg | 1200×400 | PROMO 1 |
| promo-banner-2.jpg | 1200×400 | PROMO 2 |
| free-shipping-banner.jpg | 1200×400 | FREE SHIPPING |

### About

**Location:** `about/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| about-story.jpg | 1200×800 | OUR STORY |
| about-mission.jpg | 1200×800 | OUR MISSION |
| about-sustainability.jpg | 1200×800 | SUSTAINABILITY |

### Instagram

**Location:** `instagram/`

| Filename | Dimensions | Purpose |
|----------|------------|----------|
| instagram-1.jpg | 600×600 | INSTAGRAM 1 |
| instagram-2.jpg | 600×600 | INSTAGRAM 2 |
| instagram-3.jpg | 600×600 | INSTAGRAM 3 |
| instagram-4.jpg | 600×600 | INSTAGRAM 4 |
| instagram-5.jpg | 600×600 | INSTAGRAM 5 |
| instagram-6.jpg | 600×600 | INSTAGRAM 6 |

## 🔄 Usage Instructions

### Replacing Placeholders with Actual Images

1. **Prepare your image** at the specified dimensions
2. **Optimize for web** (compress to <500KB for banners, <200KB for products)
3. **Save with the exact filename** listed above
4. **Place in the correct directory** under `public/images/`

### Image Optimization Tips

- Use JPG for photographs
- Use PNG for images with transparency
- Consider WebP format for better compression
- Compress images before uploading (use TinyPNG, ImageOptim, etc.)

### Next.js Image Component

All images are served through Next.js Image component for automatic optimization:
- Automatic resizing
- Modern format conversion (WebP/AVIF)
- Lazy loading
- Blur-up placeholders

## 📝 Notes

- SVG placeholders are temporary and should be replaced with actual images
- Maintain the specified aspect ratios for best results
- Keep file sizes optimized for web performance
- Use descriptive alt text in components
