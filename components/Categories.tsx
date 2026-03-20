'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const categories = [
  { id: 'imported', name: 'Imported', image: 'https://picsum.photos/seed/imported-choc/400/400', emoji: '🌍', desc: 'From Belgium to Japan' },
  { id: 'premium', name: 'Premium', image: 'https://picsum.photos/seed/premium-choc/400/400', emoji: '👑', desc: 'Luxury selections' },
  { id: 'budget', name: 'Budget', image: 'https://picsum.photos/seed/budget-choc/400/400', emoji: '💰', desc: 'Sweet deals' },
  { id: 'cookies', name: 'Cookies', image: 'https://picsum.photos/seed/cookies/400/400', emoji: '🍪', desc: 'Crunchy delights' },
  { id: 'combos', name: 'Combos', image: 'https://picsum.photos/seed/combos/400/400', emoji: '🎁', desc: 'Gift hampers' },
];

export function Categories() {
  return (
    <section className="py-20 bg-[#0D0705] overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#D4AF37] text-sm tracking-[0.2em] uppercase font-medium mb-2 block">Collections</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#FFF3E0] mb-2">
              Shop by <span className="gold-text-gradient italic font-light">Category</span>
            </h2>
            <p className="text-[#FFF3E0]/40 text-sm md:text-base">Find exactly what you&apos;re craving</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/categories" className="hidden md:flex items-center text-[#D4AF37] font-medium hover:text-[#F9F295] transition-colors group text-sm">
              View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="flex overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory hide-scrollbar gap-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', bounce: 0.3 }}
              className="snap-start shrink-0 w-44 md:w-56 group cursor-pointer"
            >
              <Link href={`/category/${category.id}`} className="block relative">
                <motion.div
                  className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 border border-[#3E2723]/50 group-hover:border-[#D4AF37]/40 transition-all duration-500 gloss-reflection"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0705]/90 via-[#0D0705]/30 to-transparent" />
                  
                  {/* Hover overlay with emoji */}
                  <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 transition-colors duration-500 flex items-center justify-center">
                    <motion.span
                      className="text-5xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    >
                      {category.emoji}
                    </motion.span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[#FFF3E0]/50 text-[10px] uppercase tracking-wider">{category.desc}</p>
                  </div>
                </motion.div>
                <h3 className="text-center font-display font-semibold text-lg text-[#FFF3E0] group-hover:text-[#D4AF37] transition-colors duration-300">
                  <span className="hover-underline-gold">{category.name}</span>
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
