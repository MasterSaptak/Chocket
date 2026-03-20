'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { InstallPWA } from './InstallPWA';

/* ── Animated Choco Globe — Earth as a chocolate ball ── */
function ChocoGlobe() {
  return (
    <motion.div
      className="inline-block relative align-middle"
      style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
      >
        <defs>
          {/* Chocolate sphere gradient */}
          <radialGradient id="chocoSphere" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="35%" stopColor="#5D4037" />
            <stop offset="70%" stopColor="#3E2723" />
            <stop offset="100%" stopColor="#1A0F0B" />
          </radialGradient>

          {/* Glossy highlight */}
          <radialGradient id="chocoGloss" cx="35%" cy="30%" r="35%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Gold continent fill */}
          <linearGradient id="goldContinent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F9F295" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          {/* Clip to circle */}
          <clipPath id="globeClip">
            <circle cx="60" cy="60" r="56" />
          </clipPath>
        </defs>

        {/* Base chocolate sphere */}
        <circle cx="60" cy="60" r="56" fill="url(#chocoSphere)" />

        {/* Continents group — counter-rotates so they spin on the globe surface */}
        <g clipPath="url(#globeClip)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="-360 60 60"
            dur="20s"
            repeatCount="indefinite"
          />
          {/* North America */}
          <path
            d="M28,30 Q32,22 42,24 Q48,20 52,26 Q50,34 44,38 Q38,42 32,38 Q26,36 28,30Z"
            fill="url(#goldContinent)"
            opacity="0.85"
          />
          {/* South America */}
          <path
            d="M38,52 Q42,48 46,52 Q48,60 46,68 Q44,74 40,72 Q36,68 36,60 Q36,56 38,52Z"
            fill="url(#goldContinent)"
            opacity="0.8"
          />
          {/* Europe */}
          <path
            d="M58,28 Q62,24 66,28 Q68,32 66,36 Q62,38 58,34 Q56,32 58,28Z"
            fill="url(#goldContinent)"
            opacity="0.85"
          />
          {/* Africa */}
          <path
            d="M60,42 Q66,38 70,42 Q74,50 72,60 Q70,68 66,70 Q62,68 60,60 Q58,50 60,42Z"
            fill="url(#goldContinent)"
            opacity="0.8"
          />
          {/* Asia */}
          <path
            d="M72,26 Q78,22 86,26 Q92,32 90,38 Q86,44 82,46 Q76,48 74,42 Q70,36 72,26Z"
            fill="url(#goldContinent)"
            opacity="0.85"
          />
          {/* Australia */}
          <path
            d="M84,60 Q88,56 92,60 Q94,64 90,68 Q86,66 84,60Z"
            fill="url(#goldContinent)"
            opacity="0.8"
          />
          {/* Wrapped-around continents (for seamless rotation) */}
          <path
            d="M108,30 Q112,22 122,24 Q128,20 132,26 Q130,34 124,38 Q118,42 112,38 Q106,36 108,30Z"
            fill="url(#goldContinent)"
            opacity="0.85"
          />
          <path
            d="M118,52 Q122,48 126,52 Q128,60 126,68 Q124,74 120,72 Q116,68 116,60 Q116,56 118,52Z"
            fill="url(#goldContinent)"
            opacity="0.8"
          />
        </g>

        {/* Glossy reflection */}
        <circle cx="60" cy="60" r="56" fill="url(#chocoGloss)" />

        {/* Rim highlight */}
        <circle
          cx="60" cy="60" r="55"
          fill="none"
          stroke="url(#goldContinent)"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Tiny specular highlight */}
        <ellipse cx="42" cy="36" rx="12" ry="8" fill="white" opacity="0.12" />
      </svg>

      {/* Orbiting gold particles */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#D4AF37]"
          style={{
            top: '50%',
            left: '50%',
            boxShadow: '0 0 4px rgba(212,175,55,0.8)',
          }}
          animate={{
            x: [
              Math.cos((i * 2 * Math.PI) / 3) * 38,
              Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 38,
              Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 38,
            ],
            y: [
              Math.sin((i * 2 * Math.PI) / 3) * 38,
              Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 38,
              Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 38,
            ],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </motion.div>
  );
}

/* ── Gold dust particle system ── */
function GoldDustParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 4}px`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
    driftX: `${(Math.random() - 0.5) * 80}px`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="gold-dust"
          style={{
            left: p.left,
            bottom: '-10px',
            '--dust-size': p.size,
            '--dust-duration': p.duration,
            '--dust-delay': p.delay,
            '--dust-x': p.driftX,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Liquid chocolate SVG drip at section bottom ── */
function LiquidChocolateDrip() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <svg
        className="w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ height: '80px', display: 'block' }}
      >
        <defs>
          <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3E2723" />
            <stop offset="50%" stopColor="#1A0F0B" />
            <stop offset="100%" stopColor="#0D0705" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 L0,40 Q40,35 80,40 Q100,10 130,35 Q160,25 200,40 Q230,0 270,30 Q300,20 340,40 Q370,30 400,40 Q430,5 470,30 Q500,20 540,40 Q560,35 600,40 Q630,8 670,30 Q700,22 740,40 Q780,15 820,35 Q850,25 880,40 Q910,30 940,40 Q970,12 1010,30 Q1040,22 1080,40 Q1100,35 1140,40 Q1170,8 1210,30 Q1240,20 1280,40 Q1320,28 1360,40 Q1400,35 1440,40 L1440,120 Z"
          fill="url(#dripGrad)"
        />
        <path
          d="M0,120 L0,55 Q60,50 120,55 Q150,25 190,50 Q240,40 280,55 Q320,15 370,45 Q410,35 450,55 Q490,45 530,55 Q560,20 600,45 Q640,35 680,55 Q720,42 760,55 Q790,22 830,45 Q870,38 910,55 Q950,45 990,55 Q1020,28 1060,48 Q1100,38 1140,55 Q1180,45 1220,55 Q1260,30 1300,48 Q1340,42 1380,55 Q1420,50 1440,55 L1440,120 Z"
          fill="#0D0705"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

/* ── Main Hero Component ── */
export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-screen flex items-center justify-center -mt-20 md:-mt-24 pt-20 md:pt-24"
    >
      {/* Parallax Background Image */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <Image
          src="/hero-bg.png"
          alt="Luxurious chocolate swirl background with truffles and cocoa"
          fill
          className="object-cover object-center"
          style={{ objectPosition: '50% 55%' }}
          priority
          quality={90}
        />
        {/* Subtle dark overlay — lets the warm chocolates breathe */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0705]/60 via-[#0D0705]/20 to-[#0D0705]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0705]/50 via-transparent to-[#0D0705]/50" />
        {/* Warm amber tint to blend the image with the palette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 40% 60%, rgba(101,55,27,0.15) 0%, transparent 70%)' }} />
      </motion.div>

      {/* Radial vignette */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, #0D0705 100%)',
      }} />

      {/* Gold dust */}
      <GoldDustParticles />

      {/* Main content */}
      <motion.div
        className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center"
        style={{ y: textY, opacity }}
      >
        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full glass-dark border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium tracking-[0.25em] uppercase"
        >
          <span className="inline-flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </span>
          <span>Premium Artisan Chocolates</span>
          <span className="inline-flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 + 0.5 }}
              />
            ))}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold leading-[1.05] mb-6 tracking-tight text-[#FFF3E0]"
        >
          Deliver{' '}
          <motion.span
            className="gold-text-gradient inline-block font-light italic"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Happiness
          </motion.span>
          <br />
          <span className="text-[#FFF3E0]/60 text-[0.6em] font-light">
            Worldwide
          </span>{' '}
          <ChocoGlobe />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-[#FFF3E0]/60 mb-14 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Experience the world&apos;s finest artisan chocolates — handcrafted with passion,
          wrapped in elegance, and delivered to your doorstep across borders.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-5"
        >
          <Link
            href="/shop"
            className="group relative inline-flex items-center justify-center px-10 py-4 rounded-full gold-gradient text-[#1A0F0B] font-semibold text-lg transition-all duration-500 hover:scale-110 active:scale-95 cta-glow overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Explore Chocolates
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-white/25 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full" />
          </Link>

          <Link
            href="/shop?category=gifts"
            className="group inline-flex items-center justify-center px-10 py-4 rounded-full glass-dark text-[#FFF3E0] font-medium text-lg hover:bg-white/10 transition-all duration-500 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              🎁 Send as Gift
            </span>
          </Link>

          <InstallPWA />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 flex items-center gap-8 text-[#FFF3E0]/40 text-xs tracking-wider uppercase"
        >
          {['🇧🇪 Belgium', '🇨🇭 Swiss', '🇫🇷 France', '🇮🇹 Italy'].map((origin, i) => (
            <motion.span
              key={origin}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.15 }}
            >
              {origin}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[#D4AF37]/60 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-[#D4AF37]/60 scroll-indicator" />
      </motion.div>

      {/* Liquid drip transition */}
      <LiquidChocolateDrip />
    </section>
  );
}
