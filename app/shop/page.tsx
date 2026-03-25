import { Metadata } from 'next';
import { getAllProducts, seedProductsIfEmpty } from '@/lib/products';
import ShopPageClient from './ShopPageClient';

export const metadata: Metadata = {
  title: 'Shop Premium Artisan Chocolates | Chocket',
  description: 'Explore our curated collection of luxury chocolates from world-renowned artisans. Belgian truffles, Swiss bars, and artisan hampers delivered worldwide.',
  openGraph: {
    title: 'Shop Premium Artisan Chocolates | Chocket',
    description: 'Explore our curated collection of luxury chocolates from world-renowned artisans.',
    images: [{ url: 'https://chocket.saptech.online/api/og?title=Luxury%20Chocolate%20Collection' }],
  },
};

export default async function ShopPage() {
  // SSR Seed and Fetch
  await seedProductsIfEmpty();
  const products = await getAllProducts();

  return (
    <div className="bg-[#0D0705] min-h-screen">
      <ShopPageClient initialProducts={products} />
    </div>
  );
}
