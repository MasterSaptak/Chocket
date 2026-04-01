'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Package, FileEdit, BarChart2, ShoppingBag, Eye,
  TrendingUp, DollarSign, Boxes, Loader2, LogOut, Search,
  ArrowDownRight, ArrowUpRight, Edit3, X, Clock,
  CheckCircle, XCircle, Send, AlertTriangle, ArrowLeft, ArrowRight,
  Bell, Truck, Check, Store, Plus, Upload
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';
import { logout } from '@/lib/auth';
import { subscribeToProducts, addProductByRole } from '@/lib/products';
import { createProductVersion, getVersionsBySeller } from '@/lib/productVersions';
import { subscribeToSellerOrders, updateOrderStatusByRole } from '@/lib/orders';
import type { Order } from '@/lib/orders';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { ProductVersion, Product } from '@/types';
import Link from 'next/link';
import { SmartImage } from '@/components/SmartImage';

interface ProductView {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  buyingPrice?: number;
  stock: number;
  images: string[];
  description?: string;
  sellerId?: string;
}

type TabType = 'overview' | 'products' | 'appeals' | 'analytics' | 'orders';

// ===== EDIT APPEAL MODAL =====
function EditAppealModal({
  product,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  product: ProductView;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice?.toString() || '');
  const [stock, setStock] = useState(product.stock.toString());
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description || '');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for your edit request');
      return;
    }
    onSubmit({
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: parseInt(stock),
      category,
      description,
      images: product.images,
      editReason: reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#1A0F0B] border border-[#3E2723] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-[#3E2723] flex items-center justify-between sticky top-0 bg-[#1A0F0B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <FileEdit className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#FFF3E0]">Edit Appeal</h3>
              <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider">Submit changes for review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#FFF3E0]/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-[#0D0705]/60 rounded-xl border border-[#3E2723]">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <SmartImage src={product.images[0]} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="font-medium text-sm text-[#FFF3E0]">{product.name}</p>
              <p className="text-[10px] text-[#FFF3E0]/40">ID: {product.id.slice(0, 12)}...</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Selling Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
                  className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">MRP / Original (₹)</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} min="0"
                  className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0"
                  className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required
                  className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all resize-none" />
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Reason for Edit *
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} required
                placeholder="Explain why these changes are needed..."
                className="w-full mt-2 px-4 py-3 bg-[#0D0705]/60 border border-amber-500/20 rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Edit Appeal</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ===== CREATE PRODUCT MODAL =====
function CreateProductModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const addImageUrl = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) return;
    if (!trimmedUrl.startsWith('http')) {
      toast.error('Please enter a valid URL');
      return;
    }
    setImages((prev) => [...prev, trimmedUrl]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  };

  const showUploadUnderConstruction = () => {
    toast.info('Adding images from local device is under construction. Please use an image URL for now.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = newImageUrl.trim() && newImageUrl.startsWith('http')
      ? [...images, newImageUrl.trim()]
      : images;

    if (finalImages.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    onSubmit({
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: parseInt(stock),
      category,
      description,
      images: finalImages,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#1A0F0B] border border-[#3E2723] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-[#3E2723] flex items-center justify-between sticky top-0 bg-[#1A0F0B] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#FFF3E0]">Add New Product</h3>
              <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider">Publish or submit for review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#FFF3E0]/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Selling Price (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">MRP / Original (₹)</label>
              <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} min="0"
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0"
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. Cookies"
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required
              className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all resize-none" />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold text-[#FFF3E0]/60 uppercase tracking-wider">Product Images</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                placeholder="Paste image URL..."
                className="w-full mt-1.5 px-4 py-3 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="mt-1.5 rounded-xl border border-[#D4AF37]/20 bg-white/5 px-4 py-3 text-[#D4AF37] transition-all hover:bg-white/10"
              >
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
                Upload from device
              </button>
              <span className="text-xs text-[#FFF3E0]/50">Local upload is under construction. Please use a public image URL.</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {images.map((url, index) => (
                <div key={url + index} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <SmartImage src={url} alt={`Product ${index + 1}`} fill className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {index !== 0 && (
                      <button type="button" onClick={() => setMainImage(index)} className="text-[10px] font-medium text-[#D4AF37] hover:underline">
                        Set Main
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(index)} className="text-[10px] font-medium text-red-400 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full mt-4 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Product</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ===== MAIN SELLER DASHBOARD =====
function SellerDashboardContent() {
  const router = useRouter();
  const { user, userData, role } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [allProducts, setAllProducts] = useState<ProductView[]>([]);
  const [appeals, setAppeals] = useState<ProductVersion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductView | null>(null);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Subscriptions
  useEffect(() => {
    if (!user) return;
    
    // Products
    const unsubProducts = subscribeToProducts((fetchedProducts: any[]) => {
      const formatted = fetchedProducts.map(p => ({
        id: p.id,
        name: p.name || 'Unknown',
        category: p.category || 'Uncategorized',
        price: p.price || 0,
        originalPrice: p.originalPrice,
        buyingPrice: p.buyingPrice,
        stock: p.stock ?? 0,
        images: p.images || [],
        description: p.description || '',
        sellerId: p.sellerId,
      }));
      setAllProducts(formatted);
      setIsLoading(false);
    });

    // Orders
    const unsubOrders = subscribeToSellerOrders(user.uid, (fetchedOrders) => {
      setOrders(fetchedOrders);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  // Appeals (one-time fetch or periodic refresh)
  const loadAppeals = async () => {
    if (!user) return;
    try {
      const versions = await getVersionsBySeller(user.uid);
      setAppeals(versions);
    } catch (error) {
      console.error('Error loading appeals:', error);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handleSubmitEditAppeal = async (data: Record<string, any>) => {
    if (!user || !editingProduct) return;
    setIsSubmittingAppeal(true);
    try {
      await createProductVersion({
        productId: editingProduct.id,
        productData: data,
        createdBy: user.uid,
      });
      toast.success('Edit appeal submitted! A manager will review your changes.');
      setEditingProduct(null);
      await loadAppeals();
      setActiveTab('appeals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit edit appeal');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const handleSubmitCreateProduct = async (data: Record<string, any>) => {
    if (!user || !role) return;
    setIsSubmittingCreate(true);
    try {
      const newProduct: any = {
        name: data.name,
        price: data.price,
        originalPrice: data.originalPrice,
        stock: data.stock,
        category: data.category,
        description: data.description,
        images: data.images,
        sellerId: user.uid,
        brand: 'Partner Brand',
        rating: 0,
        reviews: 0,
      };
      
      await addProductByRole(newProduct as any, user.uid, role);
      if (role === 'seller') {
         toast.success('Product submitted for review! It will appear once approved by a manager.');
      } else {
         toast.success('Product created and published instantly! ✨');
      }
      setIsCreatingProduct(false);
      await loadAppeals(); // if it went to pending queue
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!user || !role) return;
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatusByRole(orderId, newStatus, user.uid, role, 'Status updated by seller');
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter products based on real-time role
  const products = allProducts.filter(p => 
    role === 'primeadmin' || role === 'manager' || p.sellerId === user?.uid || !p.sellerId || p.sellerId === 'system'
  );

  // Derived metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const avgPrice = totalProducts ? (products.reduce((acc, p) => acc + p.price, 0) / totalProducts).toFixed(0) : '0';
  const pendingAppeals = appeals.filter(a => a.status === 'pending_review').length;
  
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  // Total Revenue (Orders delivered)
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Price Drop Opportunities (Products with < 10% discount and stock > 20)
  const priceDropOpps = products.filter(p => {
    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    return discount < 10 && p.stock > 20;
  });

  const getAppealStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="h-screen overflow-y-auto w-full relative bg-[#0D0705] text-[#FFF3E0]">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-[#1A0F0B]/90 backdrop-blur-xl border-b border-[#3E2723]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-[#FFF3E0]/60 hover:text-[#FFF3E0] transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">Back to Store</span>
            </Link>
            
            <div className="h-6 w-px bg-white/10"></div>
            
            <Link href="/" className="flex items-center gap-3 group/logo cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover/logo:scale-110 transition-transform">
                <Store className="w-5 h-5 text-[#1A0F0B]" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-[#FFF3E0] leading-tight group-hover/logo:text-[#D4AF37] transition-colors">
                  Seller <span className="text-[#D4AF37]">Hub</span>
                </h1>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                  Partner Portal
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#FFF3E0]/60 hover:text-[#FFF3E0] hover:bg-white/5 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              {(pendingAppeals > 0 || outOfStockProducts.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#1A0F0B]"></span>
              )}
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#FFF3E0]">{userData?.name || 'Seller'}</p>
                <p className="text-xs text-[#FFF3E0]/40">Authenticated Seller</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ===== TAB NAVIGATION ===== */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-[#1A0F0B]/50 p-1.5 rounded-2xl border border-white/5">
          {[
            { id: 'overview', icon: Home, label: 'Overview' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'appeals', icon: FileEdit, label: 'Edit Appeals', badge: pendingAppeals },
            { id: 'analytics', icon: BarChart2, label: 'Analytics' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders', badge: orders.filter(o => o.status === 'processing').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 text-[#D4AF37] border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/5'
                  : 'text-[#FFF3E0]/50 hover:text-[#FFF3E0] hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-[#D4AF37] text-[#1A0F0B]' : 'bg-white/10'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                {/* Welcome & Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-gradient-to-br from-[#1A0F0B] to-[#0D0705] border border-[#3E2723] rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-display font-bold text-[#FFF3E0] mb-2">
                        Welcome back, {userData?.name?.split(' ')[0] || 'Partner'}! 👋
                      </h2>
                      <p className="text-[#FFF3E0]/60 max-w-md">
                        Your store is looking good. You have {orders.filter(o => o.status === 'processing').length} orders awaiting processing and {totalProducts} active products.
                      </p>
                      <div className="flex gap-4 mt-6">
                        <button onClick={() => setActiveTab('products')} className="px-5 py-2.5 bg-[#D4AF37] text-[#1A0F0B] font-bold rounded-xl hover:bg-[#B8860B] transition-colors text-sm">
                          Manage Products
                        </button>
                        <button onClick={() => setActiveTab('orders')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#FFF3E0] font-bold rounded-xl transition-colors text-sm">
                          View Orders
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-3xl p-6 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-[#FFF3E0]/50 font-medium">Total Revenue Delivered</p>
                        <p className="text-2xl font-bold text-[#FFF3E0]">₹{totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 hover:bg-[#D4AF37]/10 transition-colors">
                      <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#FFF3E0]/50 font-medium">Total Lifetime Orders</p>
                        <p className="text-2xl font-bold text-[#FFF3E0]">{orders.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts & Opportunities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock Alerts */}
                  <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold text-[#FFF3E0] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" /> Inventory Alerts
                      </h3>
                      <button onClick={() => setActiveTab('products')} className="text-xs text-[#D4AF37] hover:underline">View All</button>
                    </div>
                    {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                      <div className="text-center py-6 text-[#FFF3E0]/40 text-sm">Inventory is healthy! ✨</div>
                    ) : (
                      <div className="space-y-3">
                        {outOfStockProducts.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <span className="text-sm font-medium text-[#FFF3E0] truncate mr-4">{p.name}</span>
                            <span className="text-[10px] uppercase font-bold text-red-400 px-2 py-1 rounded bg-red-500/10 whitespace-nowrap">Out of Stock</span>
                          </div>
                        ))}
                        {lowStockProducts.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <span className="text-sm font-medium text-[#FFF3E0] truncate mr-4">{p.name}</span>
                            <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-1 rounded bg-amber-500/10 whitespace-nowrap">{p.stock} left</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Growth Opportunities */}
                  <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold text-[#FFF3E0] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" /> Growth Tips
                      </h3>
                    </div>
                    {priceDropOpps.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <ArrowDownRight className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#FFF3E0] border-b border-transparent pb-1">Discount Strategy</p>
                            <p className="text-xs text-[#FFF3E0]/60 mt-1">You have {priceDropOpps.length} products with high stock and low discount. Run a sale to clear inventory faster.</p>
                            <button onClick={() => { setSearchQuery(''); setActiveTab('products'); }} className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300">Review products →</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-[#FFF3E0]/40 text-sm">Your catalog is highly optimized! 🚀</div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* --- PRODUCTS TAB --- */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1A0F0B] p-5 rounded-2xl border border-[#3E2723]">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#FFF3E0]">Product Management</h2>
                    <p className="text-xs text-[#FFF3E0]/40 mt-1">Submit changes via Edit Appeals or add new</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-[#FFF3E0] placeholder:text-[#FFF3E0]/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                      />
                    </div>
                    <button onClick={() => setIsCreatingProduct(true)} className="w-full sm:w-auto px-4 py-2 bg-[#D4AF37] text-[#1A0F0B] font-bold rounded-xl hover:bg-[#B8860B] transition-colors text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[#D4AF37]/20">
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                </div>

                <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Product</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Price Details</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Stock Status</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                          <tr><td colSpan={4} className="p-12 text-center text-[#FFF3E0]/40"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading catalog...</td></tr>
                        ) : products.filter(p => (p.name+p.category).toLowerCase().includes(searchQuery.toLowerCase())).map((product) => {
                          const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                          const hasPendingAppeal = appeals.some(a => a.productId === product.id && a.status === 'pending_review');
                          
                          return (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#0D0705]">
                                    <SmartImage src={product.images[0]} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-[#FFF3E0] max-w-[200px] truncate">{product.name}</p>
                                    <p className="text-xs text-[#FFF3E0]/40 mt-0.5">{product.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#D4AF37]">₹{product.price}</span>
                                  {product.originalPrice && (
                                    <span className="text-xs text-[#FFF3E0]/30 line-through">₹{product.originalPrice}</span>
                                  )}
                                </div>
                                {discount > 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">{discount}% OFF</span>}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-xs font-bold ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {product.stock > 0 ? `${product.stock} Units` : 'Out of Stock'}
                                  </span>
                                  {/* Health bar */}
                                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                     <div className={`h-full rounded-full ${product.stock > 20 ? 'bg-emerald-500' : product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {hasPendingAppeal ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1.5 rounded-lg border border-amber-500/20">
                                    <Clock className="w-3 h-3" /> Appeal Pending
                                  </span>
                                ) : (
                                  <button onClick={() => setEditingProduct(product)} className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-[#D4AF37] text-[#FFF3E0] hover:text-[#1A0F0B] rounded-lg transition-all flex items-center gap-1 ml-auto">
                                    <Edit3 className="w-3 h-3" /> Edit Request
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- APPEALS TAB --- */}
            {activeTab === 'appeals' && (
              <motion.div key="appeals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-[#3E2723]">
                    <h2 className="text-lg font-display font-bold text-[#FFF3E0]">Edit Appeal History</h2>
                    <p className="text-xs text-[#FFF3E0]/40 mt-1">Track status of your requested changes</p>
                  </div>
                  
                  {appeals.length === 0 ? (
                    <div className="p-16 text-center">
                      <FileEdit className="w-12 h-12 text-[#FFF3E0]/10 mx-auto mb-4" />
                      <p className="text-[#FFF3E0]/60 font-medium">No edit appeals submitted.</p>
                      <button onClick={() => setActiveTab('products')} className="mt-4 px-4 py-2 bg-[#D4AF37] text-[#1A0F0B] text-xs font-bold rounded-lg hover:bg-[#B8860B] transition-colors">
                        Go to Products to edit
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {appeals.map((appeal) => {
                        const data: any = appeal.data || {};
                        const targetProduct = products.find(p => p.id === appeal.productId);
                        return (
                          <div key={appeal.id} className="p-6 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-[#FFF3E0] text-sm">
                                    Edit Appeal: {targetProduct?.name || data.name || 'Unknown Product'}
                                  </h4>
                                  {getAppealStatusBadge(appeal.status)}
                                </div>
                                <p className="text-[10px] text-[#FFF3E0]/40 font-mono mb-4">
                                  Submitted: {new Date(appeal.createdAt).toLocaleString()}
                                </p>
                                
                                {data.editReason && (
                                  <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                                    <p className="text-xs text-[#FFF3E0]/50 font-medium flex items-center gap-1 mb-1">
                                      <FileEdit className="w-3 h-3" /> Seller's Reason:
                                    </p>
                                    <p className="text-sm text-[#FFF3E0]/80 italic">"{data.editReason}"</p>
                                  </div>
                                )}

                                {appeal.status === 'rejected' && (appeal as any).rejectionReason && (
                                  <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <p className="text-xs text-red-400 font-bold mb-1">Rejection Reason:</p>
                                    <p className="text-sm text-red-200">{(appeal as any).rejectionReason}</p>
                                  </div>
                                )}

                                {/* Diff View UI */}
                                <div className="grid grid-cols-2 gap-4">
                                  {targetProduct && Object.entries(data).map(([key, val]) => {
                                    if (key === 'editReason' || key === 'images') return null;
                                    const oldVal = (targetProduct as any)[key];
                                    if (oldVal !== val && val !== undefined && val !== '') {
                                      return (
                                        <div key={key} className="p-3 bg-black/40 rounded-lg border border-white/5 flex flex-col justify-center">
                                          <span className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider font-bold mb-1">{key}</span>
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="text-red-400 line-through">{String(oldVal)}</span>
                                            <ArrowRight className="w-3 h-3 text-[#FFF3E0]/30" />
                                            <span className="text-emerald-400 font-bold">{String(val)}</span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                 </div>
              </motion.div>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category Breakdown (Simple CSS bars) */}
                  <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-3xl p-6">
                    <h3 className="font-display font-bold text-[#FFF3E0] mb-6 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D4AF37]" /> Products by Category
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {} as Record<string, number>))
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-xs font-semibold text-[#FFF3E0]/80 mb-1">
                            <span>{cat}</span>
                            <span>{count}</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(count / totalProducts) * 100}%` }} className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full"></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Health */}
                  <div className="bg-[#1A0F0B] border border-[#3E2723] rounded-3xl p-6">
                    <h3 className="font-display font-bold text-[#FFF3E0] mb-6 flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-blue-400" /> Stock Health Matrix
                    </h3>
                    <div className="flex items-end gap-2 h-48 pb-6 border-b border-white/10 relative">
                       {/* Healthy */}
                       <div className="flex-1 flex flex-col items-center gap-2">
                         <motion.div initial={{ height: 0 }} animate={{ height: `${(products.filter(p => p.stock > 10).length / Math.max(1, totalProducts)) * 100}%` }} className="w-full max-w-[40px] bg-emerald-500/80 rounded-t-md min-h-[4px]"></motion.div>
                         <span className="text-xs text-[#FFF3E0]/50">Healthy</span>
                       </div>
                       {/* Low */}
                       <div className="flex-1 flex flex-col items-center gap-2">
                         <motion.div initial={{ height: 0 }} animate={{ height: `${(products.filter(p => p.stock > 0 && p.stock <= 10).length / Math.max(1, totalProducts)) * 100}%` }} className="w-full max-w-[40px] bg-amber-500/80 rounded-t-md min-h-[4px]"></motion.div>
                         <span className="text-xs text-[#FFF3E0]/50">Low (&lt;10)</span>
                       </div>
                       {/* Out */}
                       <div className="flex-1 flex flex-col items-center gap-2">
                         <motion.div initial={{ height: 0 }} animate={{ height: `${(products.filter(p => p.stock === 0).length / Math.max(1, totalProducts)) * 100}%` }} className="w-full max-w-[40px] bg-red-500/80 rounded-t-md min-h-[4px]"></motion.div>
                         <span className="text-xs text-[#FFF3E0]/50">Out</span>
                       </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-[#3E2723]">
                    <h2 className="text-lg font-display font-bold text-[#FFF3E0] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-400" /> Fulfillment Queue
                    </h2>
                    <p className="text-xs text-[#FFF3E0]/40 mt-1">Manage processing, shipping, and delivery of your orders</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Order ID</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Items</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Total Amount</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                          <tr><td colSpan={5} className="p-12 text-center text-[#FFF3E0]/40">No orders found.</td></tr>
                        ) : orders.map(order => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-5 py-4">
                              <p className="font-mono text-sm text-[#FFF3E0]">{order.id.slice(0,8)}</p>
                              <p className="text-[10px] text-[#FFF3E0]/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-[#FFF3E0]">{order.items.length} items</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-semibold text-emerald-400">₹{order.totalAmount}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                order.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {/* Sellers can only progress order forward: processing -> shipped -> delivered */}
                              <div className="flex justify-end gap-2">
                                {order.status === 'pending' && <span className="text-xs text-[#FFF3E0]/30 italic">Awaiting Payment</span>}
                                {order.status === 'processing' && (
                                  <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'shipped')} className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors flex items-center gap-1">
                                    {updatingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Truck className="w-3 h-3"/>} Mark Shipped
                                  </button>
                                )}
                                {order.status === 'shipped' && (
                                  <button disabled={updatingOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors flex items-center gap-1">
                                    {updatingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>} Mark Delivered
                                  </button>
                                )}
                                {order.status === 'delivered' || order.status === 'cancelled' ? (
                                  <span className="text-xs text-[#FFF3E0]/30 italic">Archived</span>
                                ): null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Edit Appeal Modal */}
      <AnimatePresence>
        {isCreatingProduct && (
          <CreateProductModal
            onClose={() => setIsCreatingProduct(false)}
            onSubmit={handleSubmitCreateProduct}
            isSubmitting={isSubmittingCreate}
          />
        )}
        {editingProduct && (
          <EditAppealModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={handleSubmitEditAppeal}
            isSubmitting={isSubmittingAppeal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <RouteGuard allowedRoles={['seller', 'manager', 'primeadmin']}>
      <SellerDashboardContent />
    </RouteGuard>
  );
}
