import { db } from './firebase';
import { collection, doc, getDocs, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import type { Currency, ExchangeRate, CurrencySettings, CurrencyPrice, ProductPricing, Product, ProductMarketPricing } from '@/types';
import { getDefaultMarket } from './product-adapter';

const EXCHANGE_RATES_COLLECTION = 'exchange_rates';
const CURRENCY_SETTINGS_DOC = 'settings/currency';

// Default exchange rates (fallback)
const DEFAULT_RATES: Record<string, number> = {
  'INR_USD': 0.012,
  'INR_EUR': 0.011,
  'INR_BDT': 1.44,
  'USD_INR': 83.5,
  'USD_EUR': 0.92,
  'USD_BDT': 120,
  'EUR_INR': 90.8,
  'EUR_USD': 1.09,
  'EUR_BDT': 130,
  'BDT_INR': 0.69,
  'BDT_USD': 0.0083,
  'BDT_EUR': 0.0077,
};

export const SUPPORTED_CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'BDT'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  BDT: '৳',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  BDT: 'Bangladeshi Taka',
};

// Cache for exchange rates
let ratesCache: Map<string, number> = new Map();
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===== EXCHANGE RATE MANAGEMENT =====

export async function getExchangeRate(from: Currency, to: Currency): Promise<number> {
  if (from === to) return 1;

  const rateKey = `${from}_${to}`;
  const now = Date.now();

  // Check cache first
  if (ratesCache.has(rateKey) && (now - lastCacheUpdate) < CACHE_DURATION) {
    return ratesCache.get(rateKey)!;
  }

  try {
    // Try to get from Firestore
    const ratesRef = collection(db, EXCHANGE_RATES_COLLECTION);
    const q = query(ratesRef, where('baseCurrency', '==', from), where('targetCurrency', '==', to));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const rateDoc = snapshot.docs[0];
      const rate = rateDoc.data().rate;
      ratesCache.set(rateKey, rate);
      return rate;
    }

    // Fallback to default rates
    const fallbackRate = DEFAULT_RATES[rateKey];
    if (fallbackRate) {
      ratesCache.set(rateKey, fallbackRate);
      return fallbackRate;
    }

    // Try inverse rate
    const inverseKey = `${to}_${from}`;
    const inverseRate = DEFAULT_RATES[inverseKey];
    if (inverseRate) {
      const rate = 1 / inverseRate;
      ratesCache.set(rateKey, rate);
      return rate;
    }

    console.warn(`No exchange rate found for ${from} to ${to}, using 1:1`);
    return 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return DEFAULT_RATES[rateKey] || 1;
  }
}

export async function setExchangeRate(from: Currency, to: Currency, rate: number): Promise<void> {
  const rateData: Omit<ExchangeRate, 'id'> = {
    baseCurrency: from,
    targetCurrency: to,
    rate,
    lastUpdated: new Date().toISOString(),
    source: 'manual',
  };

  const docId = `${from}_${to}`;
  await setDoc(doc(db, EXCHANGE_RATES_COLLECTION, docId), rateData);
  
  // Update cache
  ratesCache.set(docId, rate);
  lastCacheUpdate = Date.now();
}

export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const ratesRef = collection(db, EXCHANGE_RATES_COLLECTION);
    const snapshot = await getDocs(ratesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExchangeRate));
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return [];
  }
}

// ===== CURRENCY CONVERSION =====

export async function convertPrice(amount: number, from: Currency, to: Currency): Promise<number> {
  if (from === to) return amount;
  
  const rate = await getExchangeRate(from, to);
  return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
}

export async function convertCurrencyPrice(price: CurrencyPrice, targetCurrency: Currency): Promise<CurrencyPrice> {
  const convertedAmount = await convertPrice(price.amount, price.currency, targetCurrency);
  return {
    amount: convertedAmount,
    currency: targetCurrency,
  };
}

export async function convertProductPricing(pricing: ProductPricing, targetCurrency: Currency): Promise<ProductPricing> {
  const [buying, base, selling] = await Promise.all([
    convertCurrencyPrice(pricing.buying, targetCurrency),
    convertCurrencyPrice(pricing.base, targetCurrency),
    convertCurrencyPrice(pricing.selling, targetCurrency),
  ]);

  return { buying, base, selling };
}

// ===== DISCOUNT CALCULATIONS =====

export function calculateDiscountedPrice(price: CurrencyPrice, discount: { type: 'percentage' | 'flat'; value: number }): CurrencyPrice {
  let discountedAmount = price.amount;

  if (discount.type === 'percentage') {
    discountedAmount = price.amount * (1 - discount.value / 100);
  } else if (discount.type === 'flat') {
    discountedAmount = Math.max(0, price.amount - discount.value);
  }

  return {
    amount: Math.round(discountedAmount * 100) / 100,
    currency: price.currency,
  };
}

export function getDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

// ===== CURRENCY SETTINGS =====

export async function getCurrencySettings(): Promise<CurrencySettings> {
  try {
    const settingsDoc = await getDoc(doc(db, CURRENCY_SETTINGS_DOC));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as CurrencySettings;
    }
  } catch (error) {
    console.error('Error fetching currency settings:', error);
  }

  // Return defaults
  return {
    defaultCurrency: 'INR',
    autoConversion: true,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    lastRateUpdate: new Date().toISOString(),
  };
}

export async function updateCurrencySettings(settings: CurrencySettings): Promise<void> {
  await setDoc(doc(db, CURRENCY_SETTINGS_DOC), settings);
}

// ===== FORMATTING UTILITIES =====

export function formatPrice(price: CurrencyPrice, showSymbol = true): string {
  const symbol = showSymbol ? CURRENCY_SYMBOLS[price.currency] : '';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price.amount);
  
  return `${symbol}${formattedAmount}`;
}

export function getMarketDiscountPercent(market: ProductMarketPricing): number {
  if (market.listPrice <= 0 || market.customerPrice >= market.listPrice) return 0;
  return Math.round(((market.listPrice - market.customerPrice) / market.listPrice) * 100);
}

export function getMarketSavings(market: ProductMarketPricing): number {
  if (market.customerPrice >= market.listPrice) return 0;
  return Math.round((market.listPrice - market.customerPrice) * 100) / 100;
}

export function getProductPrimaryMarket(product: Product): ProductMarketPricing {
  return getDefaultMarket(product);
}

export function formatMultiCurrencyPrice(
  basePrice: CurrencyPrice,
  targetCurrencies: Currency[]
): Promise<string> {
  return new Promise(async (resolve) => {
    try {
      const conversions = await Promise.all(
        targetCurrencies
          .filter(currency => currency !== basePrice.currency)
          .slice(0, 3) // Limit to 3 additional currencies
          .map(async currency => {
            const converted = await convertCurrencyPrice(basePrice, currency);
            return formatPrice(converted);
          })
      );

      const baseFormatted = formatPrice(basePrice);
      if (conversions.length === 0) {
        resolve(baseFormatted);
      } else {
        resolve(`${baseFormatted} ≈ ${conversions.join(' | ')}`);
      }
    } catch (error) {
      resolve(formatPrice(basePrice));
    }
  });
}

// ===== INITIALIZATION =====

export async function initializeDefaultRates(): Promise<void> {
  try {
    const rates = await getAllExchangeRates();
    if (rates.length === 0) {
      // Set up default rates
      const ratePromises = Object.entries(DEFAULT_RATES).map(([key, value]) => {
        const [from, to] = key.split('_') as [Currency, Currency];
        return setExchangeRate(from, to, value);
      });
      await Promise.all(ratePromises);
      console.log('Default exchange rates initialized');
    }
  } catch (error) {
    console.error('Error initializing default rates:', error);
  }
}