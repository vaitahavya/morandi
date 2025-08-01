import HeroBanner from '@/components/landing/HeroBanner';
import CollectionTiles from '@/components/landing/CollectionTiles';
import ProductGrid from '@/components/products/ProductGrid';
import InstagramFeed from '@/components/landing/InstagramFeed';
import MarketingSection from '@/components/landing/MarketingSection';
import NewsletterSignup from '@/components/layout/NewsletterSignup';

import SecondHero from '@/components/landing/SecondHero';

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CollectionTiles />

      <section className="mx-auto max-w-7xl px-4 py-12">
  
        <h2 className="mb-6 text-2xl font-bold">Featured Products</h2>
        <ProductGrid />
      </section>

      <SecondHero />
      <MarketingSection />
      <InstagramFeed />
      <NewsletterSignup />
    </div>
  );
}
