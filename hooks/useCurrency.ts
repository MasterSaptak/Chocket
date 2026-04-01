'use client';

import { useState, useEffect } from 'react';
import { getCurrencySettings } from '@/lib/currency';
import type { Currency, CurrencySettings } from '@/types';

export function useCurrency() {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('INR');
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currencySettings = await getCurrencySettings();
      setSettings(currencySettings);
      
      // Check localStorage for user preference
      const saved = localStorage.getItem('chocket_currency');
      if (saved && currencySettings.supportedCurrencies.includes(saved as Currency)) {
        setCurrentCurrency(saved as Currency);
      } else {
        setCurrentCurrency(currencySettings.defaultCurrency);
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('chocket_currency', currency);
  };

  return {
    currentCurrency,
    settings,
    isLoading,
    changeCurrency,
    supportedCurrencies: settings?.supportedCurrencies || ['INR'],
  };
}