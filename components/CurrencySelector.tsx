'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { Currency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/types';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function CurrencySelector({ 
  value, 
  onChange, 
  disabled = false, 
  label,
  className = '' 
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c === value) || 'INR';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-[#FFF3E0]/80 block mb-2">{label}</label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#D4AF37]">
            {CURRENCY_SYMBOLS[selectedCurrency]}
          </span>
          <span className="font-medium">{selectedCurrency}</span>
          <span className="text-[#FFF3E0]/60 text-sm">
            {CURRENCY_NAMES[selectedCurrency]}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-[#FFF3E0]/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[#1A0F0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <motion.button
                  key={currency}
                  type="button"
                  onClick={() => {
                    onChange(currency);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#D4AF37]">
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <span className="font-medium text-[#FFF3E0]">{currency}</span>
                    <span className="text-[#FFF3E0]/60 text-sm">
                      {CURRENCY_NAMES[currency]}
                    </span>
                  </div>
                  {currency === selectedCurrency && (
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}