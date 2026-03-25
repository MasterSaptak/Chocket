'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Scale, ShoppingBag, Truck, RotateCcw, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditions() {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <FileText className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Welcome to Chocket. By accessing our website and using our services, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase. Chocket is an artisan chocolate platform dedicated to providing premium global delicacies.'
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      icon: <User className="w-5 h-5 text-[#D4AF37]" />,
      content: 'You must be at least 18 years old or under the supervision of a parent or legal guardian to use our services. By using our site, you represent that you meet these eligibility requirements.'
    },
    {
      id: 'account',
      title: '3. Account Responsibility',
      icon: <Shield className="w-5 h-5 text-[#D4AF37]" />,
      content: 'You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your sole responsibility. Chocket reserves the right to terminate accounts that violate our security protocols.'
    },
    {
      id: 'orders',
      title: '4. Orders & Payments',
      icon: <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />,
      content: 'All orders are subject to acceptance and availability. Prices are listed in INR and include taxes unless otherwise specified. Payment must be made through our authorized payment gateways. We reserve the right to refuse any order.'
    },
    {
      id: 'shipping',
      title: '5. Shipping & Delivery',
      icon: <Truck className="w-5 h-5 text-[#D4AF37]" />,
      content: 'We use premium cold-chain delivery for sensitive artisan chocolates. Estimated delivery times are indicative. Title and risk of loss pass to you upon delivery to the carrier.'
    },
    {
      id: 'returns',
      title: '6. Returns & Refunds',
      icon: <RotateCcw className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Due to the perishable nature of our products, returns are only accepted for damaged or incorrect items reported within 24 hours of delivery. Refunds will be processed to the original payment method after quality verification.'
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      icon: <Scale className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Chocket shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our products. Our total liability is limited to the amount paid for the specific order in question.'
    },
    {
      id: 'governing-law',
      title: '8. Governing Law',
      icon: <HelpCircle className="w-5 h-5 text-[#D4AF37]" />,
      content: 'These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0705] py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#3E2723]/10 rounded-full blur-[150px] pointer-events-none" />

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
            Terms & <span className="text-[#D4AF37]">Conditions</span>
          </h1>
          <p className="text-[#FFF3E0]/40 text-sm mb-16 uppercase tracking-[0.3em] font-medium">
            Last Updated: March 25, 2026
          </p>

          <div className="space-y-12">
            {sections.map((section, idx) => (
              <motion.section 
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 hover:border-[#D4AF37]/30 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#D4AF37]/10 rounded-2xl group-hover:bg-[#D4AF37]/20 transition-all">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-[#FFF3E0]">{section.title}</h2>
                </div>
                <p className="text-[#FFF3E0]/70 leading-relaxed text-lg">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <div className="mt-20 p-10 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-3xl text-center">
            <h3 className="text-2xl font-display font-bold text-[#FFF3E0] mb-4">Have Questions?</h3>
            <p className="text-[#FFF3E0]/60 mb-8 max-w-lg mx-auto">
              If you have any queries regarding our terms, please reach out to our legal team at 
              <strong className="text-[#D4AF37]"> legal@chocket.saptech.online</strong>.
            </p>
            <button className="gold-gradient text-[#1A0F0B] px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Fixed import for User icon
import { User } from 'lucide-react';
