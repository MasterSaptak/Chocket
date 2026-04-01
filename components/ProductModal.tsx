'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Currency, ProductIntakeDraft } from '@/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductIntakeDraft) => Promise<void>;
}

const CATEGORIES = ['Premium', 'Imported', 'Desserts', 'Cookies', 'Gifts', 'Artisan', 'Organic'];
const CURRENCIES: Currency[] = ['USD', 'INR', 'BDT', 'EUR'];
const COUNTRIES = [
  'India',
  'Bangladesh',
  'United States',
  'Germany',
  'France',
  'Belgium',
  'Switzerland',
  'Japan',
  'Brazil',
  'Ghana',
  'Madagascar',
  'Ecuador',
];

export function ProductModal({ isOpen, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductIntakeDraft>({
    name: '',
    category: 'Premium',
    originCountry: 'India',
    originMrp: {
      amount: 0,
      currency: 'USD',
    },
    mainImageUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: '',
      category: 'Premium',
      originCountry: 'India',
      originMrp: {
        amount: 0,
        currency: 'USD',
      },
      mainImageUrl: '',
    });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (formData.originMrp.amount <= 0) {
      toast.error('Original MRP must be greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving product intake draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A0F0B] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-[#2C1A12]/50 p-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-[#FFF3E0]">Simple Add Product</h2>
              <p className="mt-1 text-sm text-[#FFF3E0]/60">
                Fast bulk intake. You can modify and publish it later from the dashboard.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#FFF3E0]/60 transition-colors hover:bg-white/5 hover:text-[#D4AF37]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            <form id="simple-product-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Product Name</span>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    placeholder="e.g. Lindt Excellence Dark 70%"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Section / Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Origin Country</span>
                  <select
                    value={formData.originCountry}
                    onChange={(e) => setFormData(prev => ({ ...prev, originCountry: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Original MRP</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originMrp.amount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      originMrp: { ...prev.originMrp, amount: Number(e.target.value) },
                    }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">MRP Currency</span>
                  <select
                    value={formData.originMrp.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      originMrp: { ...prev.originMrp, currency: e.target.value as Currency },
                    }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Main Image URL</span>
                  <input
                    type="url"
                    value={formData.mainImageUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainImageUrl: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    placeholder="https://example.com/product-image.jpg"
                  />
                  <p className="text-xs text-[#FFF3E0]/45">
                    Optional now. You can add or replace more images later in Modify & Publish.
                  </p>
                </label>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#2C1A12]/40 p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-[#FFF3E0]/70 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              form="simple-product-form"
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-6 py-3 font-semibold text-[#1A0F0B] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Draft
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
