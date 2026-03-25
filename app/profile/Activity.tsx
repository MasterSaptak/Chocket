'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Heart, Eye, Package, 
  ChevronRight, Timer, Truck, CheckCircle2,
  XCircle, ArrowRight, ExternalLink, RotateCcw
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getAllOrders, Order } from '@/lib/orders';
import { Product } from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';

export default function Activity() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'recent'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      // In a real app we'd filter orders by user ID. 
      // For now, assume this helper handles that or we'll filter here.
      const all = await getAllOrders();
      setOrders(all.filter(o => o.userId === user?.uid));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
    }
  };

  const tabs = [
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'recent', label: 'Recently Viewed', icon: Eye },
  ];

  return (
    <div className="space-y-8">
      {/* Activity Tabs */}
      <div className="flex items-center gap-4 bg-[#1A0F0B] p-2 rounded-2xl border border-white/5 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${isActive ? 'bg-[#D4AF37] text-[#1A0F0B] shadow-lg shadow-[#D4AF37]/20' : 'text-[#FFF3E0]/40 hover:text-[#FFF3E0] hover:bg-white/5'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div 
            key="orders" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 glass-dark border border-[#3E2723]/30 rounded-2xl animate-pulse" />
              ))
            ) : orders.length === 0 ? (
              <div className="py-20 text-center glass-dark border border-[#3E2723]/30 rounded-[40px]">
                <ShoppingBag className="w-12 h-12 text-[#FFF3E0]/10 mx-auto mb-4" />
                <p className="text-[#FFF3E0]/40 font-medium">You haven't placed any orders yet.</p>
                <Link href="/shop" className="text-[#D4AF37] font-bold mt-4 inline-flex items-center gap-2 group underline underline-offset-4">
                  Go Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="glass-dark border border-[#3E2723]/50 rounded-[32px] overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#1A0F0B] border border-white/5 flex items-center justify-center text-[#D4AF37]">
                        <Package className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-display font-bold text-[#FFF3E0] text-lg uppercase tracking-tight">Order {order.id.slice(0, 8).toUpperCase()}</h4>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#FFF3E0]/40 font-medium tracking-wide">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • {order.items.length} artisan treats
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#3E2723]/30">
                      <div>
                        <p className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-widest mb-1">Grand Total</p>
                        <p className="text-2xl font-display font-bold text-[#D4AF37]">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <button className="gold-gradient text-[#1A0F0B] px-8 py-3.5 rounded-full font-bold shadow-lg text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div 
            key="wishlist" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
             <div className="col-span-2 py-20 text-center glass-dark border border-[#3E2723]/30 rounded-[40px]">
                <Heart className="w-12 h-12 text-[#FFF3E0]/10 mx-auto mb-4" />
                <p className="text-[#FFF3E0]/40 font-medium">Your wishlist is empty.</p>
                <Link href="/shop" className="text-[#D4AF37] font-bold mt-4 inline-flex items-center gap-2 group underline underline-offset-4">
                  Explore Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
          </motion.div>
        )}

        {activeTab === 'recent' && (
          <motion.div 
            key="recent" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div className="col-span-full py-12 px-6 bg-[#D4AF37]/5 border border-dashed border-[#D4AF37]/20 rounded-3xl text-center">
              <RotateCcw className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-3" />
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Recently Viewed Feature Coming Soon</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
