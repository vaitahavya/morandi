import HeroSection from '@/components/landing/HeroSection';
import VideoHeroSection from '@/components/landing/VideoHeroSection';
import StorytellingSection from '@/components/landing/StorytellingSection';
import GreaterPurposeSection from '@/components/landing/GreaterPurposeSection';
import OurCraftSection from '@/components/landing/OurCraftSection';
import WhyMorandiSection from '@/components/landing/WhyMorandiSection';
import SustainabilityBanner from '@/components/landing/SustainabilityBanner';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <VideoHeroSection />
      <StorytellingSection />
      <GreaterPurposeSection />
      <OurCraftSection />
      <WhyMorandiSection />
      <SustainabilityBanner />
    </div>
  );
}
