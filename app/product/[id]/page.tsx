import { Metadata } from 'next';
import { getProductById, getFeaturedProducts } from '@/lib/products';
import ProductPageClient from './ProductPageClient';
import Link from 'next/link';
import { CURRENCY_SYMBOLS } from '@/lib/currency';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found | Chocket',
    };
  }

  // Dynamic OG image URL
  const ogUrl = new URL('https://chocket.saptech.online/api/og');
  ogUrl.searchParams.set('title', product.name);
  ogUrl.searchParams.set('price', `${CURRENCY_SYMBOLS.INR}${product.price}`);
  if (product.images?.[0]) {
    ogUrl.searchParams.set('image', product.images[0]);
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Handcrafted ${product.name} - Premium Artisan Chocolate.`,
    openGraph: {
      title: `${product.name} | Chocket Premium`,
      description: product.description,
      url: `https://chocket.saptech.online/product/${id}`,
      siteName: 'Chocket',
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const [product, featured] = await Promise.all([
      getProductById(id),
      getFeaturedProducts(),
    ]);

    if (!product) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-display font-bold text-primary">Product Not Found</h1>
          <Link href="/shop" className="text-accent hover:underline">Return to Shop</Link>
        </div>
      );
    }

    const relatedProducts = featured.filter(p => p.id !== id).slice(0, 4);

    const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: (product.images && product.images[0]) || 'https://chocket.saptech.online/logo.png',
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Chocket',
    },
    offers: {
      '@type': 'Offer',
      url: `https://chocket.saptech.online/product/${id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  );
  } catch (error) {
    console.error('Error loading product page:', error);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-display font-bold text-primary">Error Loading Product</h1>
        <Link href="/shop" className="text-accent hover:underline">Return to Shop</Link>
      </div>
    );
  }
}
