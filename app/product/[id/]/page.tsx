import { Metadata } from 'next';
import { getProductByIdAdmin } from '@/lib/products-admin';
import ProductPageClient from './ProductPageClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdAdmin(id);

  if (!product) {
    return {
      title: 'Product Not Found | Chocket',
      description: 'The requested luxury chocolate could not be found.'
    };
  }

  const ogImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://chocket.saptech.online/og-image.png';

  return {
    title: `${product.name} | Premium Artisan Chocolate`,
    description: product.description || `Experience the exquisite taste of ${product.name}. Handcrafted artisan chocolate from Chocket.`,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://chocket.saptech.online/product/${id}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [ogImage],
    },
  };
}

export default function ProductPage({ params }: Props) {
  return <ProductPageClient params={params} />;
}
