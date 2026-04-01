'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, RefreshCw, Settings, Save, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCurrencySettings, 
  updateCurrencySettings, 
  getAllExchangeRates, 
  setExchangeRate, 
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  SUPPORTED_CURRENCIES 
} from '@/lib/currency';
import type { Currency, ExchangeRate, CurrencySettings } from '@/types';

interface CurrencySettingsProps {
  onClose?: () => void;
}

export function CurrencySettings({ onClose }: CurrencySettingsProps) {
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, ratesData] = await Promise.all([
        getCurrencySettings(),
        getAllExchangeRates()
      ]);
      setSettings(settingsData);
      setExchangeRates(ratesData);
      
      // Initialize editing rates
      const rateMap: Record<string, number> = {};
      ratesData.forEach(rate => {
        rateMap[`${rate.baseCurrency}_${rate.targetCurrency}`] = rate.rate;
      });
      setEditingRates(rateMap);
    } catch (error) {
      console.error('Error loading currency data:', error);
      toast.error('Failed to load currency settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await updateCurrencySettings({
        ...settings,
        lastRateUpdate: new Date().toISOString(),
      });
      
      // Save updated exchange rates
      const savePromises = Object.entries(editingRates).map(([key, rate]) => {
        const [from, to] = key.split('_') as [Currency, Currency];
        return setExchangeRate(from, to, rate);
      });
      
      await Promise.all(savePromises);
      
      toast.success('Currency settings saved successfully');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save currency settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateRate = (from: Currency, to: Currency, rate: number) => {
    const key = `${from}_${to}`;
    setEditingRates(prev => ({ ...prev, [key]: rate }));
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-[#FFF3E0]/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading currency settings...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#FFF3E0] flex items-center gap-3">
          <Globe className="w-8 h-8 text-[#D4AF37]" />
          Currency Management
        </h2>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {/* Currency Settings */}
      <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
          <Settings className="w-5 h-5" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#FFF3E0]/80">Default Currency</label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings(prev => prev ? { ...prev, defaultCurrency: e.target.value as Currency } : null)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all appearance-none"
            >
              {SUPPORTED_CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {CURRENCY_SYMBOLS[currency]} {currency} - {CURRENCY_NAMES[currency]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[#FFF3E0]/80">Auto Conversion</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoConversion}
                onChange={(e) => setSettings(prev => prev ? { ...prev, autoConversion: e.target.checked } : null)}
                className="sr-only peer"
              />
              <div className="w-6 h-6 border border-white/20 rounded bg-black/20 peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] transition-all flex items-center justify-center">
                {settings.autoConversion && <TrendingUp className="w-4 h-4 text-[#1A0F0B]" />}
              </div>
              <span className="text-[#FFF3E0]/80">Enable automatic currency conversion</span>
            </label>
          </div>
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Exchange Rates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_CURRENCIES.map(fromCurrency => 
            SUPPORTED_CURRENCIES
              .filter(toCurrency => toCurrency !== fromCurrency)
              .map(toCurrency => {
                const rateKey = `${fromCurrency}_${toCurrency}`;
                const currentRate = editingRates[rateKey] || 1;
                
                return (
                  <div key={rateKey} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FFF3E0]">
                          {CURRENCY_SYMBOLS[fromCurrency]} → {CURRENCY_SYMBOLS[toCurrency]}
                        </span>
                      </div>
                      <span className="text-xs text-[#FFF3E0]/60">
                        {fromCurrency} to {toCurrency}
                      </span>
                    </div>
                    
                    <input
                      type="number"
                      value={currentRate}
                      onChange={(e) => updateRate(fromCurrency, toCurrency, parseFloat(e.target.value) || 1)}
                      step="0.0001"
                      min="0"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-center font-mono"
                    />
                    
                    <div className="text-xs text-[#FFF3E0]/40 text-center">
                      1 {CURRENCY_SYMBOLS[fromCurrency]} = {currentRate.toFixed(4)} {CURRENCY_SYMBOLS[toCurrency]}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="space-y-1 text-amber-200/80">
              <li>• Exchange rates are manually set and cached for 5 minutes</li>
              <li>• Rates should be updated regularly for accuracy</li>
              <li>• All product prices are stored in their original currencies</li>
              <li>• Conversions happen in real-time on the frontend</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}