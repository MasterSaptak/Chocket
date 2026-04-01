'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { SmartImage } from './SmartImage';
import { CURRENCY_SYMBOLS } from '@/lib/currency';
import { getProductDisplayPricing, normalizeProduct } from '@/lib/product-adapter';
import type { Currency, Product, ProductMarketPricing } from '@/types';

interface SimpleEnhancedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
}

type MarketDraft = ProductMarketPricing;

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'BDT'];
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
const CATEGORIES = ['Premium', 'Imported', 'Desserts', 'Cookies', 'Gifts', 'Artisan', 'Organic'];

function createMarket(currency: Currency = 'INR', index: number = 0): MarketDraft {
  return {
    id: `market-${Date.now()}-${index}`,
    marketName: index === 0 ? 'Primary Market' : '',
    marketCode: currency,
    currency,
    listPrice: 0,
    sellingPrice: 0,
    customerPrice: 0,
  };
}

export function SimpleEnhancedProductModal({ isOpen, onClose, onSave, product }: SimpleEnhancedProductModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Chocket');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Premium');
  const [stock, setStock] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [originCountry, setOriginCountry] = useState('India');
  const [procurementCountry, setProcurementCountry] = useState('India');
  const [procurementCost, setProcurementCost] = useState(0);
  const [procurementCurrency, setProcurementCurrency] = useState<Currency>('INR');
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [wholesaleCurrency, setWholesaleCurrency] = useState<Currency>('INR');
  const [markets, setMarkets] = useState<MarketDraft[]>([createMarket('INR', 0)]);
  const [defaultMarketId, setDefaultMarketId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const normalized = normalizeProduct(product);
      const pricing = getProductDisplayPricing(normalized);
      setName(normalized.name);
      setBrand(normalized.brand || 'Chocket');
      setDescription(normalized.description || '');
      setCategory(normalized.category);
      setStock(normalized.stock || 0);
      setIsNew(Boolean(normalized.isNew));
      setIsBestSeller(Boolean(normalized.isBestSeller));
      setOriginCountry(normalized.supplyChain.originCountry || 'India');
      setProcurementCountry(normalized.supplyChain.procurementCountry || normalized.supplyChain.originCountry || 'India');
      setProcurementCost(normalized.pricing.buying.amount || 0);
      setProcurementCurrency(normalized.pricing.buying.currency || 'INR');
      setWholesalePrice(normalized.wholesale.amount || pricing.selling.amount || 0);
      setWholesaleCurrency(normalized.wholesale.currency || pricing.selling.currency || 'INR');
      setMarkets(normalized.markets.length ? normalized.markets : [createMarket('INR', 0)]);
      setDefaultMarketId(normalized.defaultMarketId || normalized.markets[0]?.id || '');
      setImages(normalized.images || []);
      setNewImageUrl('');
      return;
    }

    setName('');
    setBrand('Chocket');
    setDescription('');
    setCategory('Premium');
    setStock(0);
    setIsNew(false);
    setIsBestSeller(false);
    setOriginCountry('India');
    setProcurementCountry('India');
    setProcurementCost(0);
    setProcurementCurrency('INR');
    setWholesalePrice(0);
    setWholesaleCurrency('INR');
    const initialMarket = createMarket('INR', 0);
    setMarkets([initialMarket]);
    setDefaultMarketId(initialMarket.id);
    setImages([]);
    setNewImageUrl('');
  }, [product, isOpen]);

  const previewMarket = useMemo(
    () => markets.find(market => market.id === defaultMarketId) ?? markets[0],
    [markets, defaultMarketId]
  );

  const addImageUrl = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;
    if (!trimmedUrl.startsWith('http')) {
      toast.error('Please enter a valid URL');
      return;
    }
    setImages(prev => [...prev, trimmedUrl]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  };

  const showUploadUnderConstruction = () => {
    toast.info('Adding images from local device is under construction. Please use an image URL for now.');
  };

  const updateMarket = (marketId: string, field: keyof MarketDraft, value: string | number) => {
    setMarkets(prev =>
      prev.map(market =>
        market.id === marketId
          ? { ...market, [field]: value }
          : market
      )
    );
  };

  const addMarket = () => {
    setMarkets(prev => {
      const next = [...prev, createMarket('USD', prev.length)];
      if (!defaultMarketId) {
        setDefaultMarketId(next[0].id);
      }
      return next;
    });
  };

  const removeMarket = (marketId: string) => {
    setMarkets(prev => {
      if (prev.length === 1) {
        toast.error('At least one market is required');
        return prev;
      }

      const next = prev.filter(market => market.id !== marketId);
      if (defaultMarketId === marketId) {
        setDefaultMarketId(next[0].id);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImages = images;
    if (newImageUrl.trim()) {
      if (!newImageUrl.trim().startsWith('http')) {
        toast.error('Please enter a valid image URL');
        return;
      }
      finalImages = [...images, newImageUrl.trim()];
      setImages(finalImages);
      setNewImageUrl('');
    }

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!finalImages.length) {
      toast.error('Please add at least one product image');
      return;
    }

    if (procurementCost <= 0 || wholesalePrice <= 0) {
      toast.error('Procurement and wholesale prices must be greater than 0');
      return;
    }

    if (markets.some(market => !market.marketName.trim() || market.listPrice <= 0 || market.sellingPrice <= 0 || market.customerPrice <= 0)) {
      toast.error('Each market needs a name and valid prices');
      return;
    }

    setIsSaving(true);

    try {
      const normalizedMarkets = markets.map(market => ({
        ...market,
        marketCode: market.marketCode.trim() || market.currency,
        marketName: market.marketName.trim(),
        discount: market.listPrice > market.customerPrice ? {
          type: 'flat' as const,
          value: Math.round((market.listPrice - market.customerPrice) * 100) / 100,
          isActive: true,
        } : undefined,
      }));

      const selectedDefaultMarket = normalizedMarkets.find(market => market.id === defaultMarketId) ?? normalizedMarkets[0];

      const productData: Omit<Product, 'id'> = {
        sellerId: product?.sellerId || '',
        name: name.trim(),
        brand: brand.trim() || 'Chocket',
        description: description.trim(),
        pricing: {
          buying: { amount: procurementCost, currency: procurementCurrency },
          base: { amount: selectedDefaultMarket.listPrice, currency: selectedDefaultMarket.currency },
          selling: { amount: selectedDefaultMarket.customerPrice, currency: selectedDefaultMarket.currency },
        },
        wholesale: { amount: wholesalePrice, currency: wholesaleCurrency },
        markets: normalizedMarkets,
        defaultMarketId: selectedDefaultMarket.id,
        images: finalImages,
        category,
        stock,
        rating: product?.rating || 0,
        reviews: product?.reviews || 0,
        isBestSeller,
        isNew,
        status: 'live',
        approvedBy: product?.approvedBy || '',
        bypass: product?.bypass,
        supplyChain: {
          originCountry,
          procurementCountry,
        },
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving enhanced product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A0F0B] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-[#2C1A12]/50 p-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-[#FFF3E0]">
                {product ? 'Edit Product' : 'Add Product'}
              </h2>
              <p className="mt-1 text-sm text-[#FFF3E0]/60">
                One product form with procurement, wholesale, and per-market customer pricing.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#FFF3E0]/60 transition-colors hover:bg-white/5 hover:text-[#D4AF37]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form id="enhanced-product-form" onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37]">Product Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Product Name</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                      placeholder="Swiss dark truffle collection"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Brand</span>
                    <input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Category</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    >
                      {CATEGORIES.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Stock</span>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#FFF3E0]/80">Description</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    placeholder="Explain origin, taste profile, and why this item is special."
                  />
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 text-sm text-[#FFF3E0]/80">
                    <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                    Mark as new
                  </label>
                  <label className="flex items-center gap-3 text-sm text-[#FFF3E0]/80">
                    <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
                    Mark as best seller
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37]">Supply Chain</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Origin Country</span>
                    <select
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#FFF3E0]/80">Bought In</span>
                    <select
                      value={procurementCountry}
                      onChange={(e) => setProcurementCountry(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37]">Internal Pricing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid grid-cols-[1fr_120px] gap-3">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#FFF3E0]/80">Procurement Cost</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={procurementCost}
                        onChange={(e) => setProcurementCost(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#FFF3E0]/80">Currency</span>
                      <select
                        value={procurementCurrency}
                        onChange={(e) => setProcurementCurrency(e.target.value as Currency)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                      >
                        {CURRENCIES.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-[1fr_120px] gap-3">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#FFF3E0]/80">Wholesale Price</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={wholesalePrice}
                        onChange={(e) => setWholesalePrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#FFF3E0]/80">Currency</span>
                      <select
                        value={wholesaleCurrency}
                        onChange={(e) => setWholesaleCurrency(e.target.value as Currency)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                      >
                        {CURRENCIES.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#D4AF37]">Market Pricing</h3>
                    <p className="text-sm text-[#FFF3E0]/50">Set list, selling, and final customer prices manually for each market.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addMarket}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/20"
                  >
                    <Plus className="h-4 w-4" />
                    Add Market
                  </button>
                </div>

                <div className="space-y-4">
                  {markets.map((market, index) => {
                    const discount = market.listPrice > 0 && market.customerPrice < market.listPrice
                      ? Math.round(((market.listPrice - market.customerPrice) / market.listPrice) * 100)
                      : 0;

                    return (
                      <div key={market.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
                              Market {index + 1}
                            </span>
                            <label className="flex items-center gap-2 text-xs text-[#FFF3E0]/60">
                              <input
                                type="radio"
                                name="default-market"
                                checked={defaultMarketId === market.id}
                                onChange={() => setDefaultMarketId(market.id)}
                              />
                              Default storefront price
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMarket(market.id)}
                            className="rounded-lg p-2 text-[#FFF3E0]/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">Market Name</span>
                            <input
                              value={market.marketName}
                              onChange={(e) => updateMarket(market.id, 'marketName', e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                              placeholder="Bangladesh retail"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">Market Code</span>
                            <input
                              value={market.marketCode}
                              onChange={(e) => updateMarket(market.id, 'marketCode', e.target.value.toUpperCase())}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                              placeholder="BD"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">Currency</span>
                            <select
                              value={market.currency}
                              onChange={(e) => updateMarket(market.id, 'currency', e.target.value as Currency)}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                            >
                              {CURRENCIES.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                              ))}
                            </select>
                          </label>
                          <div className="rounded-xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 p-4 text-sm text-[#FFF3E0]/70">
                            <div>Discount</div>
                            <div className="mt-2 text-xl font-bold text-[#D4AF37]">{discount ? `${discount}%` : 'None'}</div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">List Price</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={market.listPrice}
                              onChange={(e) => updateMarket(market.id, 'listPrice', Number(e.target.value))}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">Selling Price</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={market.sellingPrice}
                              onChange={(e) => updateMarket(market.id, 'sellingPrice', Number(e.target.value))}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#FFF3E0]/80">Final Customer Price</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={market.customerPrice}
                              onChange={(e) => updateMarket(market.id, 'customerPrice', Number(e.target.value))}
                              className="w-full rounded-xl border border-white/10 bg-[#1A0F0B] px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37]">Images</h3>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[#FFF3E0] focus:border-[#D4AF37]/50 focus:outline-none"
                    placeholder="Paste image URL"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-[#1A0F0B] transition-opacity hover:opacity-90"
                  >
                    Add URL
                  </button>
                  <button
                    type="button"
                    onClick={showUploadUnderConstruction}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-[#FFF3E0]/70 transition-colors hover:bg-white/5"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={`${image}-${index}`} className="space-y-2">
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                          <SmartImage src={image} alt={`Preview ${index + 1}`} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#FFF3E0]/70 transition-colors hover:bg-white/5"
                          >
                            {index === 0 ? 'Main' : 'Make Main'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {previewMarket && (
                <section className="rounded-2xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 p-5">
                  <h3 className="text-lg font-semibold text-[#D4AF37]">Storefront Preview</h3>
                  <p className="mt-1 text-sm text-[#FFF3E0]/60">
                    Default market: {previewMarket.marketName} ({previewMarket.marketCode})
                  </p>
                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#FFF3E0]/50">Customer</div>
                      <div className="text-3xl font-bold text-[#FFF3E0]">
                        {CURRENCY_SYMBOLS[previewMarket.currency]}{previewMarket.customerPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#FFF3E0]/50">List</div>
                      <div className="text-lg text-[#FFF3E0]/40 line-through">
                        {CURRENCY_SYMBOLS[previewMarket.currency]}{previewMarket.listPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#FFF3E0]/50">Wholesale</div>
                      <div className="text-lg font-semibold text-[#D4AF37]">
                        {CURRENCY_SYMBOLS[wholesaleCurrency]}{wholesalePrice}
                      </div>
                    </div>
                  </div>
                </section>
              )}
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
              form="enhanced-product-form"
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-6 py-3 font-semibold text-[#1A0F0B] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? 'Save Product' : 'Create Product'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
