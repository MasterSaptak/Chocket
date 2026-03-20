'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Cake, PartyPopper, Plane } from 'lucide-react';

const occasions = [
  {
    id: 'birthday',
    title: 'Birthday',
    subtitle: 'Make it unforgettable',
    description: 'Surprise your loved ones with decadent chocolate cakes and luxury truffle boxes.',
    emoji: '🎂',
    icon: Cake,
    image: '/birthday-chocolate.png',
    color: '#E0AA3E',
    gradient: 'from-amber-900/80 to-amber-950/90',
    href: '/shop?occasion=birthday',
  },
  {
    id: 'love',
    title: 'Love',
    subtitle: 'Sweet as your bond',
    description: 'Heart-shaped boxes, romantic assortments, and love-infused Belgian pralines.',
    emoji: '❤️',
    icon: Heart,
    image: '/love-chocolate.png',
    color: '#E53E3E',
    gradient: 'from-rose-900/80 to-rose-950/90',
    href: '/shop?occasion=love',
  },
  {
    id: 'celebration',
    title: 'Celebration',
    subtitle: 'Toast to the moment',
    description: 'Grand hampers, champagne truffles, and festive assortments for every occasion.',
    emoji: '🎉',
    icon: PartyPopper,
    image: '/celebration-chocolate.png',
    color: '#D4AF37',
    gradient: 'from-yellow-900/80 to-yellow-950/90',
    href: '/shop?occasion=celebration',
  },
  {
    id: 'international',
    title: 'International',
    subtitle: 'No borders for sweetness',
    description: 'Send premium chocolates across borders — from Belgium to Tokyo, from Zurich to Mumbai.',
    emoji: '✈️',
    icon: Plane,
    image: '/gift-box.png',
    color: '#63B3ED',
    gradient: 'from-sky-900/80 to-sky-950/90',
    href: '/shop?delivery=international',
  },
];

export function OccasionSection() {
  return (
    <section className="py-24 bg-[#0D0705] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3E2723]/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium tracking-[0.2em] uppercase mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span>🎁</span>
            Every Moment Deserves Chocolate
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
            Shop by{' '}
            <span className="gold-text-gradient italic font-light">Occasion</span>
          </h2>
          <p className="text-[#FFF3E0]/50 text-lg max-w-xl mx-auto">
            Find the perfect chocolate gift for every special moment in life.
          </p>
        </motion.div>

        {/* Occasion grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {occasions.map((occasion, i) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.15, type: 'spring' }}
            >
              <Link href={occasion.href} className="block group">
                <div className="relative h-[280px] md:h-[320px] rounded-3xl overflow-hidden gloss-reflection">
                  {/* Background image */}
                  <Image
                    src={occasion.image}
                    alt={occasion.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${occasion.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D0705]/60 to-transparent" />

                  {/* Gold border on hover */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#D4AF37]/40 transition-all duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                      >
                        {occasion.emoji}
                      </motion.span>
                      <span
                        className="text-xs font-medium tracking-[0.2em] uppercase"
                        style={{ color: occasion.color }}
                      >
                        {occasion.subtitle}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-display font-bold text-[#FFF3E0] mb-2 group-hover:translate-x-2 transition-transform duration-500">
                      {occasion.title}
                    </h3>

                    <p className="text-[#FFF3E0]/60 text-sm mb-4 max-w-sm leading-relaxed">
                      {occasion.description}
                    </p>

                    <div className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium group-hover:gap-4 transition-all duration-500">
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
