# Hero Images Guide

## 📁 Where to Save Hero Images

### **Recommended Location**
```
public/images/banners/
├── hero-main.jpg          # Main homepage hero
├── hero-sale.jpg          # Sale/promotion hero
├── hero-new-arrival.jpg   # New arrivals hero
├── clothing-banner.jpg    # Category banners
├── electronics-banner.jpg
├── promo-banner-1.jpg     # Promotional banners
└── promo-banner-2.jpg
```

### **Image Specifications**
- **Resolution**: 1920x1080px (Full HD) or higher
- **Aspect Ratio**: 16:9 for hero banners
- **Format**: JPG (for photos), PNG (for graphics with transparency)
- **File Size**: Optimize to under 500KB for web
- **Quality**: High quality but web-optimized

## 🎯 How to Add Hero Images

### **Step 1: Save Your Image**
Place your image in `public/images/banners/` with a descriptive name:
```bash
# Example
public/images/banners/hero-main.jpg
```

### **Step 2: Configure in Code**
Add your image to `src/lib/hero-images.ts`:

```typescript
export const heroImages: Record<string, HeroImage> = {
  'your-hero-name': {
    id: 'your-hero-name',
    src: '/images/banners/your-image.jpg',
    alt: 'Descriptive alt text',
    title: 'Your Hero Title',
    subtitle: 'Your subtitle text',
    ctaText: 'Button Text',
    ctaLink: '/your-link',
    priority: true // For main hero
  }
};
```

### **Step 3: Use in Components**
```tsx
import { HeroBanner } from '@/components/ui/HeroBanner';

// By ID
<HeroBanner heroId="your-hero-name" />

// Or with custom props
<HeroBanner 
  heroImage={{
    id: 'custom',
    src: '/images/banners/custom.jpg',
    alt: 'Custom banner',
    title: 'Custom Title'
  }}
/>
```

## 🖼️ Image Naming Conventions

### **Hero Banners**
- `hero-main.jpg` - Main homepage banner
- `hero-sale.jpg` - Sale/promotional banner
- `hero-seasonal.jpg` - Seasonal campaigns

### **Category Banners**
- `clothing-banner.jpg`
- `electronics-banner.jpg`
- `home-garden-banner.jpg`

### **Promotional Banners**
- `promo-banner-1.jpg`
- `promo-banner-2.jpg`
- `free-shipping-banner.jpg`

## 🎨 Quick Setup Examples

### **Main Homepage Hero**
1. Save image as: `public/images/banners/hero-main.jpg`
2. It's already configured in the code as `'hero-main'`
3. Use it: `<MainHeroBanner />`

### **Sale Banner**
1. Save image as: `public/images/banners/hero-sale.jpg`
2. Already configured as `'hero-sale'`
3. Use it: `<SaleHeroBanner />`

### **Custom Banner**
1. Save image: `public/images/banners/my-banner.jpg`
2. Add to configuration:
```typescript
'my-banner': {
  id: 'my-banner',
  src: '/images/banners/my-banner.jpg',
  alt: 'My custom banner',
  title: 'My Title',
  subtitle: 'My subtitle',
  ctaText: 'Shop Now',
  ctaLink: '/products'
}
```
3. Use it: `<HeroBanner heroId="my-banner" />`

## 🚀 Usage in Pages

### **Homepage Hero**
```tsx
// In src/app/page.tsx
import { MainHeroBanner } from '@/components/ui/HeroBanner';

export default function HomePage() {
  return (
    <div>
      <MainHeroBanner />
      {/* Other content */}
    </div>
  );
}
```

### **Category Page Hero**
```tsx
// In src/app/products/page.tsx
import { HeroBanner } from '@/components/ui/HeroBanner';

export default function ProductsPage() {
  return (
    <div>
      <HeroBanner heroId="hero-sale" height="h-64" />
      {/* Products grid */}
    </div>
  );
}
```

### **Dynamic Hero Selection**
```tsx
import { getRandomHeroImage } from '@/lib/hero-images';

const randomHero = getRandomHeroImage();
<HeroBanner heroImage={randomHero} />
```

## 🎯 Best Practices

### **Image Optimization**
1. **Compress images** before uploading
2. **Use appropriate formats**: JPG for photos, PNG for graphics
3. **Optimize for web**: Tools like TinyPNG, ImageOptim
4. **Consider WebP format** for better compression

### **Content Guidelines**
1. **Keep text readable** - ensure good contrast
2. **Mobile-friendly**: Test on different screen sizes
3. **Clear CTAs**: Make buttons prominent
4. **Brand consistent**: Match your brand colors/fonts

### **Performance**
1. **Set priority=true** for above-the-fold heroes
2. **Use Next.js Image component** for optimization
3. **Lazy load** non-critical banners
4. **Consider multiple sizes** for responsive design

## 🔄 Easy Updates

To change a hero image:
1. **Replace the file** in `public/images/banners/`
2. **Keep the same filename** - no code changes needed!
3. **Clear browser cache** to see changes

To add new hero:
1. **Add image** to `public/images/banners/`
2. **Add configuration** to `hero-images.ts`
3. **Use the new heroId** in components

Your hero images are ready to make a great first impression! 🎨✨
