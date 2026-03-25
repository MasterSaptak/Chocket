import dynamic from 'next/dynamic';
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { getFeaturedProducts, seedProductsIfEmpty } from '@/lib/products';

// Lazy load below-the-fold sections
const BrandShowcase = dynamic(() => import('@/components/BrandShowcase').then(mod => mod.BrandShowcase));
const OffersSection = dynamic(() => import('@/components/OffersSection').then(mod => mod.OffersSection));
const OccasionSection = dynamic(() => import('@/components/OccasionSection').then(mod => mod.OccasionSection));
const CrossBorderSection = dynamic(() => import('@/components/CrossBorderSection').then(mod => mod.CrossBorderSection));

export default async function Home() {
  // SSR Seed and Fetch
  await seedProductsIfEmpty();
  const featured = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0705]">
      <Hero />
      <Categories />
      <FeaturedProducts initialProducts={featured} />
      <BrandShowcase />
      <OccasionSection />
      <OffersSection />
      <CrossBorderSection />
    </div>
  );
}
