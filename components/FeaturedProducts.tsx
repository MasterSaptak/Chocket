'use client';

import { ProductCard, Product } from './ProductCard';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface FeaturedProductsProps {
  initialProducts: Product[];
}

export function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  // We use the initialProducts passed from server for instant rendering
  const [products] = useState<Product[]>(initialProducts);

  return (
    <section className="py-24 bg-[#0D0705] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#3E2723]/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      {/* Chocolate drip bar at top */}
      <div className="choco-drip-bar">
        {[12, 25, 40, 60, 75, 90].map((left, i) => (
          <div
            key={i}
            className="choco-drip"
            style={{
              left: `${left}%`,
              '--drip-delay': `${i * 0.7}s`,
              '--drip-duration': `${4 + i * 0.3}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-14 gap-4">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#D4AF37] animate-heartbeat" />
              <span className="text-sm text-[#D4AF37] font-medium tracking-[0.2em] uppercase">Editor&apos;s Pick</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
              The <span className="gold-text-gradient italic font-light">Collection</span>
            </h2>
            <p className="text-[#FFF3E0]/40 text-lg">
              Handpicked by our editors — the finest artisan chocolates from the world&apos;s most celebrated chocolatiers.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring' }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center px-6 py-3 rounded-full glass-dark text-[#D4AF37] font-medium hover:bg-[#D4AF37]/10 transition-all border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:scale-105 duration-300 text-sm"
            >
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                type: 'spring',
                bounce: 0.25,
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
