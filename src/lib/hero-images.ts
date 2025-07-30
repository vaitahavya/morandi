// Hero images configuration
export interface HeroImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  priority?: boolean; // For Next.js Image optimization
}

// Hero images collection
export const heroImages: Record<string, HeroImage> = {
  // Main hero banners
  'hero-main': {
    id: 'hero-main',
    src: '/images/banners/hero-main.jpg',
    alt: 'Maternity Wear - Where Every Mother Blooms',
    title: 'Maternity Wear – Where Every Mother Blooms',
    subtitle: 'Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women\'s wear you\'ll love to live in.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    priority: true
  },
  
  'hero-sale': {
    id: 'hero-sale',
    src: '/images/banners/hero-sale.jpg',
    alt: 'Sale banner',
    title: 'Mega Sale - Up to 70% Off',
    subtitle: 'Limited time offer on selected items',
    ctaText: 'Shop Sale',
    ctaLink: '/products?sale=true',
    priority: false
  },
  
  'hero-new-arrival': {
    id: 'hero-new-arrival',
    src: '/images/banners/hero-new-arrival.jpg',
    alt: 'New arrivals banner',
    title: 'New Arrivals',
    subtitle: 'Check out our latest products',
    ctaText: 'View New',
    ctaLink: '/products?filter=new',
    priority: false
  }
};

// Helper functions
export function getHeroImage(id: string): HeroImage | null {
  return heroImages[id] || null;
}

export function getAllHeroImages(): HeroImage[] {
  return Object.values(heroImages);
}

export function getRandomHeroImage(): HeroImage {
  const images = getAllHeroImages();
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex] || heroImages['hero-main'];
}
