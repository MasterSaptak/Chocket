'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  const subtotal = totalPrice;
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + (subtotal > 0 ? shipping : 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#0D0705] px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 bg-[#1A0F0B] border border-[#3E2723] rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-[#D4AF37]/40" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#FFF3E0] mb-4">
            Your cart is empty
          </h1>
          <p className="text-[#FFF3E0]/40 mb-10 text-center max-w-md text-lg leading-relaxed">
            Your luxury chocolate journey awaits — explore our curated collection of the world&apos;s finest artisan chocolates.
          </p>
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full gold-gradient text-[#1A0F0B] font-semibold text-lg hover:scale-110 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-95"
          >
            Shop Collection
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-12">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-card rounded-3xl border border-border shadow-sm"
              >
                <div className="relative w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-muted shrink-0">
                  <Image src={item.product.images[0] || 'https://picsum.photos/seed/placeholder/600/600'} alt={item.product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="flex-1 flex flex-col w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/product/${item.product.id}`} className="text-xl font-display font-semibold text-primary hover:text-accent transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-lg font-bold text-primary mb-4">₹{item.product.price}</div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-background border border-border rounded-full px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="font-semibold text-primary">
                      Total: ₹{item.product.price * item.quantity}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-[2rem] p-8 border border-border shadow-md sticky top-32"
            >
              <h2 className="text-2xl font-display font-bold text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-primary">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-primary">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && subtotal < 2000 && (
                  <div className="text-xs text-accent bg-accent/10 p-2 rounded-lg">
                    Add ₹{2000 - subtotal} more to get free shipping!
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-medium text-primary">Total</span>
                  <span className="text-3xl font-bold text-primary">₹{total}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Including all taxes</p>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full h-14 font-semibold text-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                Secure Checkout
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
