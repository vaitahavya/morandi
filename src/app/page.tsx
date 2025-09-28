import HeroSection from '@/components/landing/HeroSection';
import StorytellingSection from '@/components/landing/StorytellingSection';
import GreaterPurposeSection from '@/components/landing/GreaterPurposeSection';
import FeaturedProductsSection from '@/components/landing/FeaturedProductsSection';
import WhyMorandiSection from '@/components/landing/WhyMorandiSection';
import CategorySection from '@/components/landing/CategorySection';
import SustainabilityBanner from '@/components/landing/SustainabilityBanner';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Maternity Wear */}
      <HeroSection />
      
      {/* Storytelling Section - Whispers of Wonder */}
      <StorytellingSection />
      
      {/* Our Greater Purpose */}
      <GreaterPurposeSection />
      
      {/* Featured Products Section */}
      <FeaturedProductsSection />
      
      {/* Why Morandi Lifestyle */}
      <WhyMorandiSection />
      
      {/* Category Section - Our Products */}
      <CategorySection />
      
      {/* Sustainability Banner */}
      <SustainabilityBanner />
    </div>
  );
}
