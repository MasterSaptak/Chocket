'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const brands = [
  { name: 'Godiva', country: '🇧🇪 Belgium', specialty: 'Truffles & Pralines', color: '#C5A55A' },
  { name: 'Lindt', country: '🇨🇭 Switzerland', specialty: 'Swiss Chocolate Bars', color: '#B8860B' },
  { name: 'Ferrero', country: '🇮🇹 Italy', specialty: 'Hazelnut & Rocher', color: '#D4AF37' },
  { name: 'Valrhona', country: '🇫🇷 France', specialty: 'Couverture & Ganache', color: '#8B7355' },
  { name: 'Toblerone', country: '🇨🇭 Switzerland', specialty: 'Nougat & Honey', color: '#DAA520' },
  { name: 'Neuhaus', country: '🇧🇪 Belgium', specialty: 'Luxury Pralines', color: '#CD853F' },
];

export function BrandShowcase() {
  return (
    <section className="py-24 bg-[#0D0705] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/3 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#3E2723]/15 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-[#D4AF37] to-transparent" />
              <span className="text-xs text-[#D4AF37] font-bold tracking-[0.3em] uppercase">Marketplace</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
              Explore by{' '}
              <span className="gold-text-gradient italic font-light">Brand</span>
            </h2>
            <p className="text-[#FFF3E0]/40 text-lg leading-relaxed">
              Discover world-renowned chocolatiers — all in one place.
              Every brand, handpicked for quality and craftsmanship.
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
              All Brands
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/shop?brand=${brand.name.toLowerCase()}`}
                className="group relative block p-6 md:p-8 rounded-3xl bg-[#1A0F0B] border border-[#3E2723]/60 hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]"
              >
                {/* Glow accent */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: brand.color }}
                />

                {/* Brand initial */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#2C1A12] to-[#1A0F0B] border border-[#3E2723] flex items-center justify-center mb-5 group-hover:border-[#D4AF37]/30 transition-colors duration-500">
                  <span
                    className="text-2xl md:text-3xl font-display font-black"
                    style={{ color: brand.color }}
                  >
                    {brand.name.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-lg md:text-xl font-display font-bold text-[#FFF3E0] mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {brand.name}
                </h3>
                <p className="text-[11px] text-[#FFF3E0]/30 font-semibold tracking-wider uppercase mb-2">
                  {brand.country}
                </p>
                <p className="text-xs text-[#FFF3E0]/45 font-medium">
                  {brand.specialty}
                </p>

                {/* Arrow */}
                <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-2">
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
