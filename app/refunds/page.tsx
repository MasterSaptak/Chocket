'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, AlertCircle, ShoppingBag, Clock, ShieldCheck, ThermometerSnowflake } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicy() {
  const sections = [
    {
      id: 'perishable',
      title: 'Artisan Perishables',
      icon: <ThermometerSnowflake className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Chocket specializes in delicate, artisanal chocolates and temperature-sensitive delicacies. Due to the perishable nature of these products, we generally do not accept returns once a product has been delivered to ensure food safety and quality integrity.'
    },
    {
      id: 'eligibility',
      title: 'Refund Eligibility',
      icon: <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Refunds or replacements are only processed in cases of: (a) Receipt of damaged products due to shipping, (b) Incorrect products received, or (c) Quality issues reported within 24 hours of delivery with photographic evidence.'
    },
    {
      id: 'process',
      title: 'The Quality Audit',
      icon: <Clock className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Once you report an issue, our quality team conducts a thorough 48-hour audit. If your request is approved, we will initiate a priority refund to your original payment method. Depending on your bank, it may take 5-7 business days to reflect in your account.'
    },
    {
      id: 'shipping',
      title: 'Shipping Concerns',
      icon: <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />,
      content: 'If an order is returned to us due to an incorrect address provided by the customer or unavailability at the time of several delivery attempts, a refund will not be issued. Please ensure your delivery details are accurate for premium cold-chain delivery.'
    },
    {
      id: 'cancellation',
      title: 'Order Cancellations',
      icon: <AlertCircle className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Orders can only be cancelled within 1 hour of placement, as we start preparation immediately to ensure freshness. Once an order is processed or dispatched, cancellations are no longer permitted.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0705] py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3E2723]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-widest">Back to Profile</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
            Refund <span className="text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-[#FFF3E0]/40 text-sm mb-16 uppercase tracking-[0.3em] font-medium">
            Effective Date: March 25, 2026
          </p>

          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, idx) => (
              <motion.section 
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 hover:border-[#D4AF37]/30 transition-all group flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#D4AF37]/10 transition-all border border-white/5 group-hover:border-[#D4AF37]/20 flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-[#FFF3E0] mb-3">{section.title}</h2>
                  <p className="text-[#FFF3E0]/60 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              </motion.section>
            ))}
          </div>

          <div className="mt-20 p-12 glass-dark border border-[#3E2723]/50 rounded-3xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
            <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20 shadow-glow">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-[#FFF3E0] mb-4">Priority Support Access</h3>
            <p className="text-[#FFF3E0]/50 max-w-xl mx-auto mb-8 font-medium italic">
              "We take pride in every artisan treat. If your experience is anything less than perfect, our support team is ready to conduct an immediate quality audit."
            </p>
            <button className="gold-gradient text-[#1A0F0B] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
              Initiate Refund Request
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Fixed import for CheckCircle2
import { CheckCircle2 } from 'lucide-react';
