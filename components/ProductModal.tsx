'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/components/ProductCard';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    buyingPrice: 0,
    originalPrice: 0,
    images: [],
    category: 'Premium',
    stock: 0,
    rating: 0,
    reviews: 0,
    isNew: false,
    isBestSeller: false,
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        buyingPrice: product.buyingPrice || 0,
        originalPrice: product.originalPrice || 0,
        images: product.images || [],
        category: product.category,
        stock: product.stock || 0,
        rating: product.rating,
        reviews: product.reviews,
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        buyingPrice: 0,
        originalPrice: 0,
        images: [],
        category: 'Premium',
        stock: 0,
        rating: 0,
        reviews: 0,
        isNew: false,
        isBestSeller: false,
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl) return;
    if (!newImageUrl.startsWith('http')) {
      toast.error('Please enter a valid URL');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl]
    }));
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setMainImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [mainImage] = newImages.splice(index, 1);
      return {
        ...prev,
        images: [mainImage, ...newImages]
      };
    });
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
          className="relative w-full max-w-2xl bg-[#1A0F0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Product Name</label>
                  <input 
                    required
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                    placeholder="e.g. Swiss Dark Truffle"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all appearance-none"
                  >
                    <option value="Premium">Premium</option>
                    <option value="Imported">Imported</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Gifts">Gifts</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFF3E0]/80">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all resize-none"
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Selling Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Original Price (₹)</label>
                  <input 
                    type="number" 
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Buying Price (₹)</label>
                  <input 
                    type="number" 
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFF3E0]/80">Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  />
                </div>
              </div>

              {/* Image Management Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[#FFF3E0]/80 flex items-center gap-2">
                  Product Images
                  <span className="text-[10px] text-[#D4AF37] font-normal">(First image is main)</span>
                </label>
                
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20">
                      <Image 
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

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded bg-black/20 group-hover:border-[#D4AF37]/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 bg-[#D4AF37] scale-0 peer-checked:scale-100 transition-transform rounded-[3px] m-0.5" />
                  </div>
                  <span className="text-sm text-[#FFF3E0]/80 group-hover:text-[#FFF3E0] transition-colors">Mark as New</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded bg-black/20 group-hover:border-[#D4AF37]/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 bg-[#D4AF37] scale-0 peer-checked:scale-100 transition-transform rounded-[3px] m-0.5" />
                  </div>
                  <span className="text-sm text-[#FFF3E0]/80 group-hover:text-[#FFF3E0] transition-colors">Best Seller</span>
                </label>
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
              form="product-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
