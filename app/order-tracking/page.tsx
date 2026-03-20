'use client';

import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the user successfully places an order and lands on this page
    requestAnimationFrame(() => {
      clearCart();
      setOrderNumber("CHK-" + Math.floor(Math.random() * 10000000));
    });
  }, [clearCart]);

  const currentStep = 0; // 0: Processing, 1: Packed, 2: Shipped, 3: Delivered

  const steps = [
    { title: 'Order Placed', description: 'We have received your order', icon: Clock, date: 'Just now' },
    { title: 'Processing', description: 'Your items are being packed', icon: Package, date: 'Pending' },
    { title: 'Shipped', description: 'Your order is on the way', icon: Truck, date: 'Pending' },
    { title: 'Delivered', description: 'Package arrived', icon: CheckCircle, date: 'Pending' },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl mb-8 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <p className="font-medium">Order placed successfully! Thank you for your purchase.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Track Order</h1>
            <p className="text-muted-foreground">Order <span className="font-mono text-primary font-medium">#{orderNumber}</span></p>
          </div>
          <span className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border border-accent/30">
            Processing
          </span>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-card rounded-[2rem] p-8 border border-border shadow-md mb-8">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted z-0" />
            
            {/* Active Line */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute left-6 top-6 w-0.5 bg-accent z-0" 
            />

            <div className="space-y-12 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isActive = index === currentStep;
                const Icon = step.icon;

                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`flex items-start gap-6 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors duration-500 ${
                      isActive ? 'bg-accent text-accent-foreground ring-4 ring-accent/20' : 
                      isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3 className={`text-lg font-semibold ${isActive ? 'text-accent' : 'text-primary'}`}>
                          {step.title}
                        </h3>
                        <span className="text-sm text-muted-foreground font-medium">{step.date}</span>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="text-accent font-medium hover:underline underline-offset-4">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
