#!/usr/bin/env node

/**
 * Script to generate placeholder images for the Morandi Lifestyle e-commerce website
 * This creates properly named placeholder images for all sections of the website
 */

const fs = require('fs');
const path = require('path');

// Define all placeholder images needed for the website
const placeholders = {
  // Hero & Banner Images (1920x1080 - 16:9 aspect ratio)
  banners: [
    { name: 'hero-main.jpg', width: 1920, height: 1080, label: 'MAIN HERO' },
    { name: 'hero-sale.jpg', width: 1920, height: 1080, label: 'SALE BANNER' },
    { name: 'hero-new-arrival.jpg', width: 1920, height: 1080, label: 'NEW ARRIVALS' },
    { name: 'hero-seasonal.jpg', width: 1920, height: 1080, label: 'SEASONAL' },
    { name: 'sustainability-banner.jpg', width: 1920, height: 1080, label: 'SUSTAINABILITY' },
  ],
  
  // Category Images (800x800 - 1:1 aspect ratio)
  categories: [
    { name: 'category-maternity.jpg', width: 800, height: 800, label: 'MATERNITY WEAR' },
    { name: 'category-baby.jpg', width: 800, height: 800, label: 'BABY PRODUCTS' },
    { name: 'category-bedding.jpg', width: 800, height: 800, label: 'HOME BEDDING' },
    { name: 'category-feeding.jpg', width: 800, height: 800, label: 'FEEDING APRONS' },
    { name: 'category-postpartum.jpg', width: 800, height: 800, label: 'POSTPARTUM WEAR' },
    { name: 'category-women.jpg', width: 800, height: 800, label: "WOMEN'S WEAR" },
  ],
  
  // Product Images (1000x1000 - 1:1 aspect ratio)
  products: [
    { name: 'product-placeholder-1.jpg', width: 1000, height: 1000, label: 'PRODUCT 1' },
    { name: 'product-placeholder-2.jpg', width: 1000, height: 1000, label: 'PRODUCT 2' },
    { name: 'product-placeholder-3.jpg', width: 1000, height: 1000, label: 'PRODUCT 3' },
    { name: 'product-placeholder-4.jpg', width: 1000, height: 1000, label: 'PRODUCT 4' },
    { name: 'product-placeholder-5.jpg', width: 1000, height: 1000, label: 'PRODUCT 5' },
    { name: 'product-placeholder-6.jpg', width: 1000, height: 1000, label: 'PRODUCT 6' },
  ],
  
  // Promotional Banners (1200x400 - 3:1 aspect ratio)
  promos: [
    { name: 'promo-banner-1.jpg', width: 1200, height: 400, label: 'PROMO 1' },
    { name: 'promo-banner-2.jpg', width: 1200, height: 400, label: 'PROMO 2' },
    { name: 'free-shipping-banner.jpg', width: 1200, height: 400, label: 'FREE SHIPPING' },
  ],
  
  // About/Story Images (1200x800 - 3:2 aspect ratio)
  about: [
    { name: 'about-story.jpg', width: 1200, height: 800, label: 'OUR STORY' },
    { name: 'about-mission.jpg', width: 1200, height: 800, label: 'OUR MISSION' },
    { name: 'about-sustainability.jpg', width: 1200, height: 800, label: 'SUSTAINABILITY' },
  ],
  
  // Instagram Feed Images (600x600 - 1:1 aspect ratio)
  instagram: Array.from({ length: 6 }, (_, i) => ({
    name: `instagram-${i + 1}.jpg`,
    width: 600,
    height: 600,
    label: `INSTAGRAM ${i + 1}`
  })),
};

// SVG template for placeholder images
function createSVGPlaceholder(width, height, label, color = '#d4c5b9') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${Math.min(width, height) / 15}" 
    fill="#5a5a5a" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${label}
  </text>
  <text 
    x="50%" 
    y="${50 + (100 / height) * 30}%" 
    font-family="Arial, sans-serif" 
    font-size="${Math.min(width, height) / 25}" 
    fill="#8a8a8a" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${width} × ${height}
  </text>
</svg>`;
}

// Create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

// Main function to generate all placeholders
async function generatePlaceholders() {
  console.log('🎨 Generating placeholder images for Morandi Lifestyle website...\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const baseImageDir = path.join(publicDir, 'images');
  
  // Directory structure
  const directories = {
    banners: path.join(baseImageDir, 'banners'),
    categories: path.join(baseImageDir, 'categories'),
    products: path.join(baseImageDir, 'products'),
    promos: path.join(baseImageDir, 'promos'),
    about: path.join(baseImageDir, 'about'),
    instagram: path.join(baseImageDir, 'instagram'),
  };
  
  // Ensure all directories exist
  Object.values(directories).forEach(ensureDirectoryExists);
  
  // Color scheme for different image types
  const colors = {
    banners: '#d4c5b9',      // Earthy beige
    categories: '#c8b8a8',   // Slightly darker beige
    products: '#e8ddd0',     // Lighter beige
    promos: '#a4b8a4',       // Soft sage
    about: '#d4c5b9',        // Earthy beige
    instagram: '#e0d5c7',    // Light warm beige
  };
  
  let totalGenerated = 0;
  
  // Generate placeholders for each category
  for (const [category, images] of Object.entries(placeholders)) {
    console.log(`\n📁 Generating ${category} images...`);
    
    for (const image of images) {
      const targetPath = path.join(directories[category], image.name);
      const svgContent = createSVGPlaceholder(
        image.width,
        image.height,
        image.label,
        colors[category]
      );
      
      // For now, save as SVG (can be converted to JPG with external tools)
      const svgPath = targetPath.replace('.jpg', '.svg');
      fs.writeFileSync(svgPath, svgContent);
      console.log(`  ✓ ${image.name.replace('.jpg', '.svg')} (${image.width}×${image.height})`);
      totalGenerated++;
    }
  }
  
  // Generate image reference document
  const referenceDoc = generateReferenceDocument(placeholders, directories);
  const referenceDocPath = path.join(__dirname, '..', 'IMAGE_PLACEHOLDERS_REFERENCE.md');
  fs.writeFileSync(referenceDocPath, referenceDoc);
  
  console.log(`\n✅ Successfully generated ${totalGenerated} placeholder images!`);
  console.log(`📄 Reference document created: IMAGE_PLACEHOLDERS_REFERENCE.md`);
  console.log(`\n💡 Note: SVG files are generated. To convert to JPG, use an image conversion tool or replace with actual images.`);
}

// Generate reference documentation
function generateReferenceDocument(placeholders, directories) {
  let doc = `# Image Placeholders Reference

This document lists all placeholder images generated for the Morandi Lifestyle e-commerce website.

## 📁 Directory Structure

\`\`\`
public/images/
├── banners/         # Hero banners and main promotional images
├── categories/      # Category showcase images
├── products/        # Product placeholder images
├── promos/          # Promotional banners
├── about/           # About/Story section images
└── instagram/       # Instagram feed images
\`\`\`

## 🎨 Image Specifications

`;

  for (const [category, images] of Object.entries(placeholders)) {
    doc += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    doc += `**Location:** \`${path.basename(directories[category])}/\`\n\n`;
    doc += `| Filename | Dimensions | Purpose |\n`;
    doc += `|----------|------------|----------|\n`;
    
    for (const image of images) {
      doc += `| ${image.name} | ${image.width}×${image.height} | ${image.label} |\n`;
    }
  }
  
  doc += `\n## 🔄 Usage Instructions

### Replacing Placeholders with Actual Images

1. **Prepare your image** at the specified dimensions
2. **Optimize for web** (compress to <500KB for banners, <200KB for products)
3. **Save with the exact filename** listed above
4. **Place in the correct directory** under \`public/images/\`

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
`;

  return doc;
}

// Run the script
generatePlaceholders().catch(console.error);

