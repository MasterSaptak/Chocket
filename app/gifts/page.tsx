'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Calendar, Sparkles, ArrowRight, X, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const giftCategories = [
  {
    title: 'Birthday Gifts',
    subtitle: 'Make their day unforgettable',
    icon: '🎂',
    color: '#E91E63',
    image: 'https://picsum.photos/seed/birthday-choco/600/400',
    products: [
      { name: 'Birthday Truffle Box', price: '₹1,299', image: 'https://picsum.photos/seed/bday1/300/300' },
      { name: 'Celebration Hamper', price: '₹2,499', image: 'https://picsum.photos/seed/bday2/300/300' },
      { name: 'Gold Ribbon Assortment', price: '₹1,899', image: 'https://picsum.photos/seed/bday3/300/300' },
    ]
  },
  {
    title: 'Luxury Boxes',
    subtitle: 'For connoisseurs of fine taste',
    icon: '✨',
    color: '#D4AF37',
    image: 'https://picsum.photos/seed/luxury-box/600/400',
    products: [
      { name: 'Prestige Collection', price: '₹4,999', image: 'https://picsum.photos/seed/lux1/300/300' },
      { name: 'Grand Cru Selection', price: '₹6,499', image: 'https://picsum.photos/seed/lux2/300/300' },
      { name: 'Royal Assortment', price: '₹3,999', image: 'https://picsum.photos/seed/lux3/300/300' },
    ]
  },
  {
    title: 'Romantic Gifts',
    subtitle: 'Love wrapped in chocolate',
    icon: '💝',
    color: '#FF5252',
    image: 'https://picsum.photos/seed/romantic-choc/600/400',
    products: [
      { name: 'Heart-Shaped Pralines', price: '₹1,599', image: 'https://picsum.photos/seed/rom1/300/300' },
      { name: 'Rose Gold Collection', price: '₹2,999', image: 'https://picsum.photos/seed/rom2/300/300' },
      { name: 'Velvet Love Box', price: '₹2,199', image: 'https://picsum.photos/seed/rom3/300/300' },
    ]
  }
];

function GiftModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-dark border border-[#3E2723]/60 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-display font-bold text-[#FFF3E0]">Send as Gift</h3>
            <p className="text-sm text-[#FFF3E0]/40 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-[#FFF3E0]/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-[#D4AF37]' : 'bg-[#3E2723]'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Recipient&apos;s Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Who is this gift for?"
                  className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-[#FFF3E0]/20"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!recipientName.trim()}
                className="w-full gold-gradient text-[#1A0F0B] py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
              >
                Next — Add Message
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Personal Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a heartfelt message..."
                  rows={4}
                  className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all resize-none placeholder:text-[#FFF3E0]/20"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#3E2723] text-[#FFF3E0]/70 py-3.5 rounded-full font-medium hover:bg-white/5 transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 gold-gradient text-[#1A0F0B] py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Next — Delivery
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Preferred Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                />
              </div>
              {/* Summary */}
              <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-xl p-4 space-y-2">
                <p className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Gift Summary</p>
                <p className="text-sm text-[#FFF3E0]">To: <span className="text-[#D4AF37]">{recipientName}</span></p>
                {message && <p className="text-sm text-[#FFF3E0]/60 italic">&quot;{message}&quot;</p>}
                {deliveryDate && <p className="text-sm text-[#FFF3E0]/60">Deliver on: {deliveryDate}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#3E2723] text-[#FFF3E0]/70 py-3.5 rounded-full font-medium hover:bg-white/5 transition-colors">
                  Back
                </button>
                <Link
                  href="/shop"
                  className="flex-1 gold-gradient text-[#1A0F0B] py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Choose Chocolates
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function GiftsPage() {
  const [showGiftModal, setShowGiftModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D0705]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#3E2723]/20 rounded-full blur-[200px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-dark border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-8">
              <Gift className="w-3.5 h-3.5" />
              Premium Gifting
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-[#FFF3E0] mb-6 leading-tight">
              Gift <span className="gold-text-gradient font-majestic italic">Luxury</span>
            </h1>
            <p className="text-lg text-[#FFF3E0]/50 mb-10 leading-relaxed max-w-xl mx-auto">
              Every occasion deserves the finest. Send handcrafted artisan
              chocolates with a personal touch — beautifully wrapped and delivered.
            </p>
            <button
              onClick={() => setShowGiftModal(true)}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full gold-gradient text-[#1A0F0B] font-semibold text-lg transition-all duration-500 hover:scale-110 active:scale-95 cta-glow"
            >
              <Send className="w-5 h-5" />
              Send a Gift
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Gift Categories */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="space-y-20">
            {giftCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-[#FFF3E0]">{cat.title}</h2>
                    <p className="text-[#FFF3E0]/40 text-sm mt-1">{cat.subtitle}</p>
                  </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.products.map((product, j) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.1 }}
                      className="group relative bg-[#1A0F0B] border border-[#3E2723]/60 rounded-3xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0B] via-transparent to-transparent opacity-60" />
                        
                        {/* Gift Tag */}
                        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                          <Gift className="w-3 h-3" />
                          Gift Ready
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-display font-semibold text-lg text-[#FFF3E0] mb-2 group-hover:text-[#D4AF37] transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#D4AF37]">{product.price}</span>
                          <button
                            onClick={() => setShowGiftModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/10 transition-all"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            Gift This
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && <GiftModal onClose={() => setShowGiftModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
