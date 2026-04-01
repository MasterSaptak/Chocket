'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2, Plus, Percent, DollarSign, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SmartImage } from './SmartImage';
import { CurrencySelector } from './CurrencySelector';
import type { Product, Currency, ProductPricing, ProductDiscount, SupplyChain } from '@/types';

interface EnhancedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
}

const COUNTRIES = [
  'India', 'Bangladesh', 'United States', 'Germany', 'France', 'Belgium', 
  'Switzerland', 'Japan', 'Brazil', 'Ghana', 'Madagascar', 'Ecuador'
];

const CATEGORIES = ['Premium', 'Imported', 'Desserts', 'Cookies', 'Gifts', 'Artisan', 'Organic'];

export function EnhancedProductModal({ isOpen, onClose, onSave, product }: EnhancedProductModalProps) {
  // Basic product info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Premium');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Pricing
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [buyingCurrency, setBuyingCurrency] = useState<Currency>('INR');
  const [basePrice, setBasePrice] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState<Currency>('INR');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [sellingCurrency, setSellingCurrency] = useState<Currency>('INR');

  // Discount
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountValidUntil, setDiscountValidUntil] = useState('');

  // Supply chain
  const [originCountry, setOriginCountry] = useState('India');
  const [supplier, setSupplier] = useState('');
  const [certifications, setCertifications] = useState('');

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setCategory(product.category);
      setBrand(product.brand || '');
      setStock(product.stock || 0);
      setIsNew(product.isNew || false);
      setIsBestSeller(product.isBestSeller || false);

      // Pricing
      if (product.pricing) {
        setBuyingPrice(product.pricing.buying.amount);
        setBuyingCurrency(product.pricing.buying.currency);
        setBasePrice(product.pricing.base.amount);
        setBaseCurrency(product.pricing.base.currency);
        setSellingPrice(product.pricing.selling.amount);
        setSellingCurrency(product.pricing.selling.currency);
      }

      // Discount
      if (product.discount) {
        setHasDiscount(product.discount.isActive);
        setDiscountType(product.discount.type);
        setDiscountValue(product.discount.value);
        setDiscountValidUntil(product.discount.validUntil || '');
      }

      // Supply chain
      if (product.supplyChain) {
        setOriginCountry(product.supplyChain.originCountry);
        setSupplier(product.supplyChain.supplier || '');
        setCertifications(product.supplyChain.certifications?.join(', ') || '');
      }

      setImages(product.images || []);
    } else {
      // Reset for new product
      setName('');
      setDescription('');
      setCategory('Premium');
      setBrand('');
      setStock(0);
      setIsNew(false);
      setIsBestSeller(false);
      setBuyingPrice(0);
      setBuyingCurrency('INR');
      setBasePrice(0);
      setBaseCurrency('INR');
      setSellingPrice(0);
      setSellingCurrency('INR');
      setHasDiscount(false);
      setDiscountType('percentage');
      setDiscountValue(0);
      setDiscountValidUntil('');
      setOriginCountry('India');
      setSupplier('');
      setCertifications('');
      setImages([]);
      setNewImageUrl('');
    }
  }, [product, isOpen]);

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
      const newImages = [...prev];
      const [mainImage] = newImages.splice(index, 1);
      return [mainImage, ...newImages];
    });
  };

  const showUploadUnderConstruction = () => {
    toast.info('Adding images from local device is under construction. Please use an image URL for now.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-add pending URL
    let finalImages = images;
    if (newImageUrl.trim() && newImageUrl.startsWith('http')) {
      finalImages = [...finalImages, newImageUrl.trim()];
      setNewImageUrl('');
    }

    if (finalImages.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    if (buyingPrice <= 0 || basePrice <= 0 || sellingPrice <= 0) {
      toast.error('All prices must be greater than 0');
      return;
    }

    setIsSaving(true);

    try {
      const pricing: ProductPricing = {
        buying: { amount: buyingPrice, currency: buyingCurrency },
        base: { amount: basePrice, currency: baseCurrency },
        selling: { amount: sellingPrice, currency: sellingCurrency },
      };

      const discount: ProductDiscount | undefined = hasDiscount ? {
        type: discountType,
        value: discountValue,
        isActive: true,
        validUntil: discountValidUntil || undefined,
      } : undefined;

      const supplyChain: SupplyChain = {
        originCountry,
        supplier: supplier || undefined,
        certifications: certifications ? certifications.split(',').map(c => c.trim()) : undefined,
      };

      const productData: Omit<Product, 'id'> = {
        name,
        description,
        category,
        brand: brand || 'Chocket',
        stock,
        isNew,
        isBestSeller,
        pricing,
        discount,
        supplyChain,
        images: finalImages,
        rating: 0,
        reviews: 0,
        sellerId: '',
        status: 'live',
        approvedBy: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
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
          className="relative w-full max-w-4xl bg-[#1A0F0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#2C1A12]/50">
            <h2 className="text-2xl font-display font-bold text-[#FFF3E0]">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="enhanced-product-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Product Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                      placeholder="e.g. Swiss Dark Truffle Collection"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                      placeholder="e.g. Lindt, Godiva"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all resize-none"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  Pricing & Currency
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-red-400">Buying Price</h4>
                    <div className="space-y-2">
                      <input
                        required
                        type="number"
                        value={buyingPrice}
                        onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                        placeholder="Cost price"
                      />
                      <CurrencySelector
                        value={buyingCurrency}
                        onChange={setBuyingCurrency}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-blue-400">Base Price</h4>
                    <div className="space-y-2">
                      <input
                        required
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        placeholder="MRP/Original"
                      />
                      <CurrencySelector
                        value={baseCurrency}
                        onChange={setBaseCurrency}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-[#D4AF37]">Selling Price</h4>
                    <div className="space-y-2">
                      <input
                        required
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                        placeholder="Final price"
                      />
                      <CurrencySelector
                        value={sellingCurrency}
                        onChange={setSellingCurrency}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    Discount Settings
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border border-white/20 rounded bg-black/20 peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] transition-all flex items-center justify-center">
                      {hasDiscount && <Check className="w-3 h-3 text-[#1A0F0B]" />}
                    </div>
                    <span className="text-sm text-[#FFF3E0]/80">Enable Discount</span>
                  </label>
                </div>

                {hasDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-orange-400">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-orange-400">Discount Value</label>
                      <div className="relative">
                        <input
                          required={hasDiscount}
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                          min="0"
                          max={discountType === 'percentage' ? 100 : undefined}
                          step="0.01"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-[#FFF3E0] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {discountType === 'percentage' ? (
                            <Percent className="w-4 h-4 text-orange-400" />
                          ) : (
                            <span className="text-orange-400 font-bold">{sellingCurrency}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-orange-400">Valid Until (Optional)</label>
                      <input
                        type="date"
                        value={discountValidUntil}
                        onChange={(e) => setDiscountValidUntil(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Supply Chain */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  Supply Chain & Origin
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Origin Country</label>
                    <select
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all appearance-none"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFF3E0]/80">Supplier (Optional)</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Certifications (Optional)</label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                    placeholder="e.g. Organic, Fair Trade, Kosher (comma separated)"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">5</span>
                  </div>
                  Product Images
                  <span className="text-xs text-[#D4AF37]/60 font-normal">(First image is main)</span>
                </h3>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                    placeholder="Enter image URL..."
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#D4AF37] rounded-xl border border-[#D4AF37]/20 transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={showUploadUnderConstruction}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-white/5 px-4 py-2.5 text-sm text-[#D4AF37] transition-all hover:bg-white/10"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from device (Soon)
                  </button>
                  <span className="text-xs text-[#FFF3E0]/50">
                    Local upload is under construction. Please use a public image URL.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20">
                      <SmartImage
                        src={url}
                        alt={`Product ${index}`}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className="text-[10px] font-medium text-[#D4AF37] hover:underline"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-[10px] font-medium text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-[#D4AF37] text-[#1A0F0B] text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          MAIN
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">6</span>
                  </div>
                  Product Settings
                </h3>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border border-white/20 rounded bg-black/20 peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] transition-all flex items-center justify-center">
                      {isNew && <Check className="w-3 h-3 text-[#1A0F0B]" />}
                    </div>
                    <span className="text-sm text-[#FFF3E0]/80 group-hover:text-[#FFF3E0] transition-colors">Mark as New</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border border-white/20 rounded bg-black/20 peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] transition-all flex items-center justify-center">
                      {isBestSeller && <Check className="w-3 h-3 text-[#1A0F0B]" />}
                    </div>
                    <span className="text-sm text-[#FFF3E0]/80 group-hover:text-[#FFF3E0] transition-colors">Best Seller</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/10 bg-[#2C1A12]/50 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-[#FFF3E0]/80 hover:text-[#FFF3E0] hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="enhanced-product-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}