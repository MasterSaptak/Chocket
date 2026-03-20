'use client';

import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from './CartProvider';
import { useState, useEffect } from 'react';

export function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const [show, setShow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 right-6 z-40"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <Link href="/cart">
            <motion.div
              className="glass-dark rounded-full flex items-center gap-3 border border-[#D4AF37]/30 shadow-2xl hover:border-[#D4AF37]/60 transition-all cursor-pointer"
              layout
              style={{ padding: isExpanded ? '12px 24px 12px 16px' : '14px' }}
            >
              {/* Cart icon with badge */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: totalItems > 0 ? [0, -10, 10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                </motion.div>
                <motion.span
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4AF37] text-[#1A0F0B] text-[10px] font-bold flex items-center justify-center rounded-full"
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {totalItems}
                </motion.span>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
                  >
                    <div>
                      <p className="text-[#FFF3E0] text-sm font-medium">₹{totalPrice.toFixed(0)}</p>
                      <p className="text-[#FFF3E0]/40 text-[10px]">{totalItems} items</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 rounded-full gold-glow opacity-50 blur-xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
