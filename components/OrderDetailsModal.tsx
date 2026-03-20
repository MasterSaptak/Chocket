'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Package, User, MapPin, CreditCard, Calendar, Clock, Truck, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Order, updateOrderStatus } from '@/lib/orders';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onStatusUpdate }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const statusIcons = {
    pending: Clock,
    processing: Loader2,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#1A0F0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#2C1A12]/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl border ${getStatusColor(order.status)}`}>
                  <StatusIcon className={`w-6 h-6 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-[#FFF3E0]">Order #{order.id.slice(0, 8)}</h2>
                  <p className="text-sm text-[#FFF3E0]/60 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-[#FFF3E0]/60 hover:text-[#FFF3E0] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#FFF3E0] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D4AF37]" />
                      Order Items
                    </h3>
                    <span className="text-sm text-[#FFF3E0]/60">{order.items.length} items</span>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                          <Image
                            src={item.images[0] || 'https://picsum.photos/seed/chocolate/200/200'}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#FFF3E0] truncate">{item.name}</h4>
                          <p className="text-sm text-[#FFF3E0]/60">Quantity: {item.quantity}</p>
                          <p className="text-sm font-bold text-[#D4AF37] mt-1">₹{item.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#FFF3E0]">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-6 bg-[#2C1A12]/30 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between text-sm text-[#FFF3E0]/60">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#FFF3E0]/60">
                      <span>Shipping</span>
                      <span>₹{order.shipping}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="font-bold text-[#FFF3E0]">Total Amount</span>
                      <span className="text-2xl font-display font-bold text-[#D4AF37]">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Status */}
                <div className="space-y-8">
                  {/* Status History */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#FFF3E0] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                      Status History
                    </h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6 relative">
                      {/* Timeline Line */}
                      <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-white/10" />
                      
                      <div className="space-y-6">
                        {/* Current Status (if no history) or Latest History */}
                        {(!order.statusHistory || order.statusHistory.length === 0) ? (
                          <div className="relative flex gap-4">
                            <div className={`z-10 w-8 h-8 rounded-full border-4 border-[#1A0F0B] flex items-center justify-center ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#FFF3E0] capitalize">{order.status}</p>
                              <p className="text-[10px] text-[#FFF3E0]/40">{formatDate(order.createdAt)}</p>
                              <p className="text-xs text-[#FFF3E0]/60 mt-1">Order placed</p>
                            </div>
                          </div>
                        ) : (
                          [...order.statusHistory].reverse().map((history, idx) => {
                            const HistIcon = statusIcons[history.status as keyof typeof statusIcons] || Clock;
                            return (
                              <div key={idx} className="relative flex gap-4">
                                <div className={`z-10 w-8 h-8 rounded-full border-4 border-[#1A0F0B] flex items-center justify-center ${getStatusColor(history.status)}`}>
                                  <HistIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#FFF3E0] capitalize">{history.status}</p>
                                  <p className="text-[10px] text-[#FFF3E0]/40">{formatDate(history.timestamp)}</p>
                                  {history.note && <p className="text-xs text-[#FFF3E0]/60 mt-1 italic">&quot;{history.note}&quot;</p>}
                                </div>
                              </div>
                            );
                          })
                        )}
                        
                        {/* Initial Creation Entry if history exists */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div className="relative flex gap-4 opacity-60">
                            <div className="z-10 w-8 h-8 rounded-full border-4 border-[#1A0F0B] bg-white/10 text-[#FFF3E0]/60 flex items-center justify-center">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#FFF3E0]">Order Placed</p>
                              <p className="text-[10px] text-[#FFF3E0]/40">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#FFF3E0] flex items-center gap-2">
                      <User className="w-5 h-5 text-[#D4AF37]" />
                      Customer Details
                    </h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <div>
                        <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-wider font-bold mb-1">Name</p>
                        <p className="text-[#FFF3E0] font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-wider font-bold mb-1">Contact</p>
                        <p className="text-[#FFF3E0]">{order.customerInfo.email}</p>
                        <p className="text-[#FFF3E0]/60 text-sm">{order.customerInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Shipping Address
                        </p>
                        <p className="text-[#FFF3E0] text-sm leading-relaxed">
                          {order.customerInfo.address}<br />
                          {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Payment Method
                        </p>
                        <p className="text-[#FFF3E0] text-sm capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#FFF3E0] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                      Update Status
                    </h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((status) => (
                          <button
                            key={status}
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(status)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
                              order.status === status
                                ? getStatusColor(status) + ' ring-2 ring-current ring-offset-2 ring-offset-[#1A0F0B]'
                                : 'border-white/5 text-[#FFF3E0]/60 hover:bg-white/5 hover:text-[#FFF3E0]'
                            }`}
                          >
                            <span className="capitalize font-medium">{status}</span>
                            {order.status === status && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#2C1A12]/50 flex items-center justify-between">
              <p className="text-xs text-[#FFF3E0]/40">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-[#FFF3E0] font-semibold rounded-xl transition-colors border border-white/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
