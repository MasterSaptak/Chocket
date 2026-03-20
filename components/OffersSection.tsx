'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';

function FloatingSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 10}%`,
            top: `${15 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        </motion.div>
      ))}
    </div>
  );
}

export function OffersSection() {
  return (
    <section className="py-24 bg-[#0D0705] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="bg-gradient-to-br from-[#2C1A12] to-[#1A0F0B] rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group border border-[#3E2723]/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring' }}
          whileHover={{ scale: 1.005 }}
        >
          {/* Floating sparkles */}
          <FloatingSparkles />

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="choc-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#choc-pattern)" />
            </svg>
          </div>

          {/* Gold border on hover */}
          <div className="absolute inset-0 rounded-[2.5rem] border-2 border-[#D4AF37]/0 group-hover:border-[#D4AF37]/20 transition-all duration-700" />

          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="flex-1 text-[#FFF3E0] z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium tracking-[0.15em] uppercase mb-6 border border-[#D4AF37]/20"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Gift className="w-4 h-4 animate-gentle-bounce" />
                Limited Time Offer
              </motion.span>
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Get 20% Off
                </motion.span>
                <br />
                <motion.span
                  className="gold-text-gradient italic font-light inline-block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  Your First Order
                </motion.span>
              </h2>
              <motion.p
                className="text-lg text-[#FFF3E0]/50 mb-10 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Experience the rich taste of premium chocolates delivered straight to your door. Use code{' '}
                <motion.strong
                  className="text-[#D4AF37] inline-block px-2 py-0.5 bg-[#D4AF37]/10 rounded-md border border-[#D4AF37]/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  SWEET20
                </motion.strong>{' '}
                at checkout.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/shop"
                  className="group/btn inline-flex items-center justify-center px-8 py-4 rounded-full gold-gradient text-[#1A0F0B] font-semibold hover:scale-110 active:scale-95 transition-all shadow-lg cta-glow hover-wiggle"
                >
                  <span className="flex items-center gap-2">
                    Claim Offer
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[500px] z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="absolute inset-0"
            >
              <motion.div
                className="relative w-full h-full gloss-reflection"
                whileHover={{ rotate: 0, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Image
                  src="/gift-box.png"
                  alt="Premium Chocolate Box"
                  fill
                  className="object-cover rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700"
                />
                {/* Golden shimmer on hover */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/10 group-hover:to-transparent transition-all duration-500" />
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [12, 18, 12],
                  scale: [1, 1.05, 1],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -top-8 -right-4 md:-right-8 glass-dark p-3 rounded-2xl shadow-xl border border-[#D4AF37]/20"
              >
                <Image src="/truffle-collection.png" alt="Truffle" width={80} height={80} className="rounded-xl" />
              </motion.div>

              {/* Floating chocolate emoji */}
              <motion.span
                className="absolute top-1/2 -left-4 text-4xl"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 20, -10, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                🍫
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
