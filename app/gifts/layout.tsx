import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Chocolate Gifts & Hampers | Chocket',
  description: 'Send the perfect gift with Chocket. Handcrafted artisan chocolates, luxury hampers, and personalized gift boxes for every occasion. Global delivery available.',
  openGraph: {
    title: 'Luxury Chocolate Gifting | Chocket',
    description: 'Beautifully wrapped artisan chocolates and personalized hampers for your loved ones. Make every occasion special.',
    url: 'https://chocket.saptech.online/gifts',
  }
};

export default function GiftsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
