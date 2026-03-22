'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Package, TrendingUp, Eye, BarChart3, DollarSign, Boxes,
  Loader2, LogOut, Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';
import { logout } from '@/lib/auth';
import { subscribeToProducts } from '@/lib/products';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProductView {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  buyingPrice?: number;
  stock: number;
  images: string[];
}

function SellerDashboardContent() {
  const router = useRouter();
  const { userData } = useAuth();
  const [products, setProducts] = useState<ProductView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToProducts((fetchedProducts: any[]) => {
      setProducts(fetchedProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        buyingPrice: p.buyingPrice,
        stock: p.stock ?? 0,
        images: p.images || [],
      })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const avgPrice = products.length
    ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(0)
    : '0';
  const lowStock = products.filter((p) => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-[#0D0705] text-[#FFF3E0]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1A0F0B]/90 backdrop-blur-xl border-b border-[#3E2723]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#1A0F0B]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[#FFF3E0]">
                Seller <span className="text-[#D4AF37]">Dashboard</span>
              </h1>
              <p className="text-xs text-[#FFF3E0]/40">
                Welcome, {userData?.name || 'Seller'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: totalProducts, icon: Package, color: 'from-blue-500/20 to-blue-500/5' },
            { label: 'Total Stock', value: totalStock.toLocaleString(), icon: Boxes, color: 'from-emerald-500/20 to-emerald-500/5' },
            { label: 'Avg. Price', value: `₹${avgPrice}`, icon: DollarSign, color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
            { label: 'Low Stock', value: lowStock, icon: TrendingUp, color: 'from-red-500/20 to-red-500/5' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} bg-[#1A0F0B] border border-white/10 rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-[#FFF3E0]/40" />
              </div>
              <p className="text-2xl font-bold text-[#FFF3E0]">{stat.value}</p>
              <p className="text-xs text-[#FFF3E0]/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 bg-[#1A0F0B] border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
          />
        </div>

        {/* Notice */}
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 flex items-start gap-3">
          <Eye className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#D4AF37]">View-Only Access</p>
            <p className="text-xs text-[#FFF3E0]/50 mt-1">
              As a seller, you can view product pricing and stock availability. Contact an admin to request changes.
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[#3E2723]">
            <h2 className="text-lg font-display font-bold text-[#FFF3E0]">Product Catalog</h2>
            <p className="text-xs text-[#FFF3E0]/40 mt-1">Real-time pricing and stock data</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Base Price</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/40">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/40">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, i) => {
                    const discount = product.originalPrice
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                              <Image
                                src={product.images[0] || 'https://picsum.photos/seed/choc/100/100'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium text-sm text-[#FFF3E0] truncate max-w-[200px]">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#FFF3E0]/60">{product.category}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#D4AF37]">₹{product.price}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.stock > 10
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : product.stock > 0
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {discount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                              <ArrowDownRight className="w-3 h-3" />
                              {discount}% OFF
                            </span>
                          ) : (
                            <span className="text-[#FFF3E0]/30 text-xs">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <RouteGuard allowedRoles={['seller', 'admin', 'primeadmin']}>
      <SellerDashboardContent />
    </RouteGuard>
  );
}
