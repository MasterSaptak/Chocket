'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { MapPin, Clock, Plane, ChevronDown, Globe } from 'lucide-react';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', delivery: '5-7 days', cost: '₹499' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', delivery: '4-6 days', cost: '₹449' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', delivery: '3-5 days', cost: '₹399' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', delivery: '6-8 days', cost: '₹549' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', delivery: '5-7 days', cost: '₹499' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', delivery: '4-6 days', cost: '₹449' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', delivery: '5-7 days', cost: '₹499' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', delivery: '3-4 days', cost: '₹349' },
  { code: 'FR', name: 'France', flag: '🇫🇷', delivery: '4-6 days', cost: '₹449' },
  { code: 'IN', name: 'India', flag: '🇮🇳', delivery: '1-3 days', cost: 'Free' },
];

function DeliveryPathAnimation({ selected }: { selected: typeof countries[0] | null }) {
  if (!selected) return null;

  return (
    <div className="relative w-full h-[200px] md:h-[250px] mt-8 overflow-hidden rounded-2xl bg-[#0D0705]/50 border border-[#3E2723]/50">
      {/* Animated globe background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Globe className="w-40 h-40 text-[#D4AF37]" />
      </div>

      {/* Animated route */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 200">
        {/* Route line */}
        <motion.path
          d="M 80,130 Q 200,30 350,80 Q 480,120 520,100"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          key={selected.code}
        />

        {/* Start point (India) */}
        <motion.circle
          cx="80" cy="130" r="8"
          fill="#D4AF37"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
        <motion.circle
          cx="80" cy="130" r="14"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          opacity="0.4"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ delay: 0.3, duration: 2, repeat: Infinity }}
        />

        {/* End point */}
        <motion.circle
          cx="520" cy="100" r="8"
          fill="#E0AA3E"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 }}
        />
        <motion.circle
          cx="520" cy="100" r="14"
          fill="none"
          stroke="#E0AA3E"
          strokeWidth="1"
          opacity="0.4"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ delay: 1.6, duration: 2, repeat: Infinity }}
        />

        {/* Traveling plane */}
        <motion.g
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
          style={{ offsetPath: `path('M 80,130 Q 200,30 350,80 Q 480,120 520,100')` }}
        >
          <text fontSize="20" textAnchor="middle" dominantBaseline="central">✈️</text>
        </motion.g>
      </svg>

      {/* Labels */}
      <motion.div
        className="absolute bottom-4 left-6 flex items-center gap-2 text-[#FFF3E0]/80 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-lg">🇮🇳</span>
        <span>India</span>
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-6 flex items-center gap-2 text-[#FFF3E0]/80 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        key={selected.code}
      >
        <span className="text-lg">{selected.flag}</span>
        <span>{selected.name}</span>
      </motion.div>
    </div>
  );
}

export function CrossBorderSection() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0705] via-[#1A0F0B] to-[#0D0705]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[200px]" />
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
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium tracking-[0.2em] uppercase mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Plane className="w-4 h-4" />
            Worldwide Delivery
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
            Sweetness{' '}
            <span className="gold-text-gradient italic font-light">Without Borders</span>
          </h2>
          <p className="text-[#FFF3E0]/50 text-lg max-w-xl mx-auto">
            Ship premium chocolates to 150+ countries with temperature-controlled packaging.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Country selector */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl glass-card border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{selectedCountry.flag}</span>
                <div>
                  <p className="text-[#FFF3E0] font-medium">{selectedCountry.name}</p>
                  <p className="text-[#FFF3E0]/40 text-xs">Select delivery destination</p>
                </div>
              </div>
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-5 h-5 text-[#D4AF37]" />
              </motion.div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#1A0F0B] border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[#D4AF37]/10 transition-colors text-left ${
                          selectedCountry.code === country.code ? 'bg-[#D4AF37]/10' : ''
                        }`}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1">
                          <p className="text-[#FFF3E0] text-sm font-medium">{country.name}</p>
                          <p className="text-[#FFF3E0]/40 text-xs">{country.delivery}</p>
                        </div>
                        <span className="text-[#D4AF37] text-sm font-medium">{country.cost}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Delivery info cards */}
          <motion.div
            className="grid grid-cols-3 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            key={selectedCountry.code}
          >
            <div className="glass-card rounded-2xl p-5 text-center border-[#D4AF37]/10">
              <Clock className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-[#FFF3E0] font-semibold text-lg">{selectedCountry.delivery}</p>
              <p className="text-[#FFF3E0]/40 text-xs mt-1">Estimated Time</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border-[#D4AF37]/10">
              <Plane className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-[#FFF3E0] font-semibold text-lg">{selectedCountry.cost}</p>
              <p className="text-[#FFF3E0]/40 text-xs mt-1">Shipping Cost</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border-[#D4AF37]/10">
              <MapPin className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-[#FFF3E0] font-semibold text-lg">Tracked</p>
              <p className="text-[#FFF3E0]/40 text-xs mt-1">Live Tracking</p>
            </div>
          </motion.div>

          {/* Animated delivery map */}
          <DeliveryPathAnimation selected={selectedCountry} />

          {/* Bottom features */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[#FFF3E0]/40 text-xs tracking-wider uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {['🧊 Temperature Controlled', '📦 Premium Packaging', '🔒 Secure Delivery', '🔄 Easy Returns'].map((feat) => (
              <span key={feat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3E2723]/50">
                {feat}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
