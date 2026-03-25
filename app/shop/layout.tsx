import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Chocolate Shop | Chocket',
  description: 'Browse our curated collection of artisan chocolates. From Belgian pralines to Swiss bars, find the perfect sweet experience at Chocket Shop.',
  openGraph: {
    title: 'Shop Premium Artisan Chocolates | Chocket',
    description: 'Explore the world\'s finest chocolate brands all in one place. Handcrafted truffles, bars, and gift sets.',
    url: 'https://chocket.saptech.online/shop',
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
