import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { BrandShowcase } from '@/components/BrandShowcase';
import { OffersSection } from '@/components/OffersSection';
import { OccasionSection } from '@/components/OccasionSection';
import { CrossBorderSection } from '@/components/CrossBorderSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0705]">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BrandShowcase />
      <OccasionSection />
      <OffersSection />
      <CrossBorderSection />
    </div>
  );
}
