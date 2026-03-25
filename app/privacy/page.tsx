'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Eye, Lock, Globe, Server, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const sections = [
    {
      id: 'data-collection',
      title: 'Data Collection',
      icon: <User className="w-5 h-5 text-[#D4AF37]" />,
      content: 'At Chocket, we collect personal information such as your name, email, phone, and address to facilitate orders and provide a personalized experience. We also collect usage data like IP addresses and browsing behavior to optimize our site performance.'
    },
    {
      id: 'usage',
      title: 'Usage of Data',
      icon: <Globe className="w-5 h-5 text-[#D4AF37]" />,
      content: 'Your data is primarily used for order processing, customer support, and marketing communications (with your consent). We do not sell your personal information to third parties. We use anonymized data to analyze trends and improve our services.'
    },
    {
      id: 'cookies',
      title: 'Cookies Policy',
      icon: <Eye className="w-5 h-5 text-[#D4AF37]" />,
      content: "We use cookies to remember your preferences and keep you logged in. You can manage your cookie settings through your browser, but disabling them may limit your experience on our platform."
    },
    {
      id: 'third-party',
      title: 'Third-party Services',
      icon: <Server className="w-5 h-5 text-[#D4AF37]" />,
      content: 'We share necessary data with trusted partners for payment processing (Razorpay/Stripe), delivery (BlueDart/DHL), and analytics (Google Analytics). All partners are vetted for their data security standards.'
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <UserCheck className="w-5 h-5 text-[#D4AF37]" />,
      content: 'You have the right to access, correct, or delete your personal data. You can exercise these rights through your User Command Center or by contacting our data protection officer at privacy@chocket.saptech.online.'
    },
    {
      id: 'data-protection',
      title: 'Data Protection',
      icon: <Shield className="w-5 h-5 text-[#D4AF37]" />,
      content: 'We employ industry-standard encryption (SSL/TLS) and secure database protocols to protect your information. Your data is stored on secure cloud servers with restricted access.'
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#FFF3E0] mb-4">
            Privacy <span className="text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-[#FFF3E0]/40 text-sm mb-16 uppercase tracking-[0.3em] font-medium">
            Effective Date: March 25, 2026
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, idx) => (
              <motion.section 
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 hover:border-[#D4AF37]/30 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#D4AF37]/10 transition-all border border-white/5 group-hover:border-[#D4AF37]/20">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-display font-bold text-[#FFF3E0]">{section.title}</h2>
                </div>
                <p className="text-[#FFF3E0]/60 leading-relaxed">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <div className="mt-20 p-12 glass-dark border border-[#3E2723]/50 rounded-3xl text-center">
            <div className="w-16 h-16 bg-[#D4AF37] text-[#1A0F0B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-[#FFF3E0] mb-4">Security First Architecture</h3>
            <p className="text-[#FFF3E0]/50 max-w-2xl mx-auto leading-relaxed">
              We take your data security seriously. Beyond encryption, we follow strict internal 
              compliance protocols to ensure that your artisan chocolate experience is as safe as it is delicious.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
