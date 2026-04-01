'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, TrendingUp } from 'lucide-react';
import { formatPrice, formatMultiCurrencyPrice, convertPrice, CURRENCY_SYMBOLS } from '@/lib/currency';
import type { Currency, CurrencyPrice } from '@/types';

interface CurrencyDisplayProps {
  price: CurrencyPrice;
  targetCurrencies?: Currency[];
  showMultiple?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencyDisplay({ 
  price, 
  targetCurrencies = ['USD', 'EUR', 'BDT'], 
  showMultiple = false,
  className = '',
  size = 'md' 
}: CurrencyDisplayProps) {
  const [convertedPrices, setConvertedPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showMultiple && targetCurrencies.length > 0) {
      setIsLoading(true);
      Promise.all(
        targetCurrencies
          .filter(currency => currency !== price.currency)
          .map(async (currency) => {
            const converted = await convertPrice(price.amount, price.currency, currency);
            return { currency, amount: converted };
          })
      ).then(results => {
        const priceMap: Record<string, number> = {};
        results.forEach(({ currency, amount }) => {
          priceMap[currency] = amount;
        });
        setConvertedPrices(priceMap);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [price, targetCurrencies, showMultiple]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const symbolSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size]} font-bold text-[#D4AF37] flex items-center gap-1`}>
        <span className={`${symbolSizes[size]} opacity-80`}>
          {CURRENCY_SYMBOLS[price.currency]}
        </span>
        {price.amount.toLocaleString('en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
      </div>

      {showMultiple && !isLoading && Object.keys(convertedPrices).length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-2 flex items-center gap-1 text-xs text-[#FFF3E0]/60"
        >
          <Globe className="w-3 h-3" />
          <span>≈</span>
          {Object.entries(convertedPrices).map(([currency, amount], index) => (
            <span key={currency} className="flex items-center">
              <span className="text-[#D4AF37]/80">
                {CURRENCY_SYMBOLS[currency as Currency]}
              </span>
              {amount.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
              {index < Object.keys(convertedPrices).length - 1 && (
                <span className="mx-1 text-[#FFF3E0]/40">|</span>
              )}
            </span>
          ))}
        </motion.div>
      )}

      {isLoading && showMultiple && (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#FFF3E0]/40">
          <div className="w-2 h-2 bg-[#D4AF37]/50 rounded-full animate-pulse" />
          Converting...
        </div>
      )}
    </div>
  );
}

interface DiscountBadgeProps {
  originalPrice: CurrencyPrice;
  discountedPrice: CurrencyPrice;
  className?: string;
}

export function DiscountBadge({ originalPrice, discountedPrice, className = '' }: DiscountBadgeProps) {
  const discountPercent = Math.round(
    ((originalPrice.amount - discountedPrice.amount) / originalPrice.amount) * 100
  );

  if (discountPercent <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg ${className}`}
    >
      <TrendingUp className="w-3 h-3" />
      -{discountPercent}%
    </motion.div>
  );
}