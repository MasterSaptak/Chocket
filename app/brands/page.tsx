'use client';

import { motion } from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const allBrands = [
  { name: 'Godiva', country: '🇧🇪 Belgium', specialty: 'Truffles & Pralines', color: '#C5A55A', products: 48 },
  { name: 'Lindt', country: '🇨🇭 Switzerland', specialty: 'Swiss Chocolate Bars', color: '#B8860B', products: 62 },
  { name: 'Ferrero', country: '🇮🇹 Italy', specialty: 'Hazelnut & Rocher', color: '#D4AF37', products: 35 },
  { name: 'Valrhona', country: '🇫🇷 France', specialty: 'Couverture & Ganache', color: '#8B7355', products: 28 },
  { name: 'Toblerone', country: '🇨🇭 Switzerland', specialty: 'Nougat & Honey', color: '#DAA520', products: 18 },
  { name: 'Neuhaus', country: '🇧🇪 Belgium', specialty: 'Luxury Pralines', color: '#CD853F', products: 42 },
  { name: 'Teuscher', country: '🇨🇭 Switzerland', specialty: 'Champagne Truffles', color: '#C0A060', products: 24 },
  { name: 'Pierre Marcolini', country: '🇧🇪 Belgium', specialty: 'Grand Cru Chocolate', color: '#8B6914', products: 36 },
  { name: 'La Maison du Chocolat', country: '🇫🇷 France', specialty: 'Ganache & Éclairs', color: '#A0522D', products: 31 },
  { name: 'Venchi', country: '🇮🇹 Italy', specialty: 'Gianduia & Gelato', color: '#B8860B', products: 55 },
  { name: 'Läderach', country: '🇨🇭 Switzerland', specialty: 'FrischSchoggi™', color: '#8B7765', products: 22 },
  { name: 'Amedei', country: '🇮🇹 Italy', specialty: 'Single Origin Bars', color: '#D2B48C', products: 19 },
];

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [activeCountry, setActiveCountry] = useState('All');

  const countries = ['All', '🇧🇪 Belgium', '🇨🇭 Switzerland', '🇫🇷 France', '🇮🇹 Italy'];

  const filtered = allBrands.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.specialty.toLowerCase().includes(search.toLowerCase());
    const matchCountry = activeCountry === 'All' || b.country === activeCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="min-h-screen bg-[#0D0705] py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gradient-to-r from-[#D4AF37] to-transparent" />
            <span className="text-xs text-[#D4AF37] font-bold tracking-[0.3em] uppercase">Marketplace</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-[#FFF3E0] mb-4">
            Our <span className="gold-text-gradient italic font-light">Brands</span>
          </h1>
          <p className="text-[#FFF3E0]/40 text-lg max-w-2xl leading-relaxed">
            We partner with the world&apos;s most prestigious chocolatiers. Each brand is hand-selected
            for quality, craftsmanship, and taste.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-12"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-full pl-11 pr-5 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-[#FFF3E0]/20 text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {countries.map(c => (
              <button
                key={c}
                onClick={() => setActiveCountry(c)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  activeCountry === c
                    ? 'bg-[#D4AF37] text-[#1A0F0B] shadow-lg'
                    : 'bg-[#1A0F0B] text-[#FFF3E0]/60 border border-[#3E2723] hover:border-[#D4AF37]/30 hover:text-[#FFF3E0]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/shop?brand=${brand.name.toLowerCase()}`}
                className="group relative block p-7 rounded-3xl bg-[#1A0F0B] border border-[#3E2723]/60 hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]"
              >
                {/* Glow accent */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: brand.color }}
                />

                <div className="flex items-start gap-5">
                  {/* Brand initials */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C1A12] to-[#1A0F0B] border border-[#3E2723] flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/30 transition-colors duration-500">
                    <span className="text-2xl font-display font-black" style={{ color: brand.color }}>
                      {brand.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-display font-bold text-[#FFF3E0] mb-0.5 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {brand.name}
                    </h3>
                    <p className="text-[11px] text-[#FFF3E0]/30 font-semibold tracking-wider uppercase mb-1.5">
                      {brand.country}
                    </p>
                    <p className="text-xs text-[#FFF3E0]/45 font-medium">{brand.specialty}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-[#FFF3E0]/30 font-medium">{brand.products} products</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-[#1A0F0B] border border-[#3E2723] flex items-center justify-center mx-auto mb-6">
              <Search className="w-7 h-7 text-[#FFF3E0]/20" />
            </div>
            <h3 className="text-xl font-display text-[#FFF3E0] mb-2">No brands found</h3>
            <p className="text-[#FFF3E0]/40 text-sm">Try a different search term or filter.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
