'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Package, Heart, ShieldCheck, 
  ChevronRight, AlertCircle, TrendingUp,
  CreditCard, MapPin, Zap
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from './ProfileContext';
import { calculateProfileCompleteness } from '@/lib/profile-service';

export default function ProfileDashboard() {
  const { user, userData } = useAuth();
  const { setActiveSection } = useProfile();
  const completeness = calculateProfileCompleteness(userData || {});

  const stats = [
    { label: 'Active Orders', value: '12', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Wishlist items', value: '08', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Rewards Points', value: '2,450', icon: Trophy, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
    { label: 'Saved Addresses', value: '02', icon: MapPin, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#FFF3E0]">
            Welcome back, <span className="text-[#D4AF37]">{userData?.name || user?.displayName || 'Chocolate Connoisseur'}</span>
          </h2>
          <p className="text-[#FFF3E0]/40 text-sm mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            Your Command Center is active • Last updated March 25, 2026
          </p>
        </div>
        
        {/* Verification Status */}
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl shadow-lg shadow-green-900/10">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-green-400/60 leading-none mb-1">Status</p>
            <p className="text-sm font-bold text-green-400">Identity Verified</p>
          </div>
        </div>
      </div>

      {/* Profile Completeness & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Completeness Card */}
        <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-full blur-2xl group-hover:bg-[#D4AF37]/20 transition-all" />
          
          <div>
            <h3 className="text-lg font-bold text-[#FFF3E0] mb-2 flex items-center gap-2">
              Profile Completeness
              {completeness < 100 && (
                <span className="p-1 bg-yellow-500/20 text-yellow-500 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                </span>
              )}
            </h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-display font-bold text-[#D4AF37]">{completeness}%</span>
              <p className="text-xs text-[#FFF3E0]/40 mb-2 leading-relaxed">
                Add profile image & phone <br /> to reach 100%
              </p>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                className="h-full gold-gradient rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <button 
            onClick={() => setActiveSection('profile')}
            className="mt-8 text-xs font-bold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37] transition-all flex items-center gap-2 group/btn"
          >
            Update Profile Info
            <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1A0F0B] border border-[#3E2723]/50 rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between"
            >
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#FFF3E0] text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-[#FFF3E0]/30 text-[10px] uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rewards Tier Status */}
      <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 border-4 border-[#1A0F0B] relative">
            <Trophy className="w-10 h-10 text-[#1A0F0B]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-[#1A0F0B] flex items-center justify-center font-bold text-xs border-2 border-[#1A0F0B]">
              L2
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-display font-bold text-[#FFF3E0] mb-2 flex items-center justify-center md:justify-start gap-3">
              Elite Gold Member Status
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 font-bold">VIP</span>
            </h4>
            <div className="max-w-md">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[#FFF3E0]/40">Progress to Platinum Tier</span>
                <span className="text-[#D4AF37]">550 Points Remaining</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <div className="h-full w-[65%] gold-gradient rounded-full" />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="text-xs text-green-400 flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                Active Since 2024
              </span>
              <button className="text-xs text-[#D4AF37] font-bold underline decoration-[#D4AF37]/30 underline-offset-4 hover:decoration-[#D4AF37]">
                View Tier Benefits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Actions */}
      <h3 className="text-lg font-display font-bold text-[#FFF3E0] uppercase tracking-widest">Priority Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Set default payment method', sub: 'Speed up your next checkout', icon: CreditCard, action: 'payments' },
          { label: 'Add a secondary address', sub: 'Gifting to friends or family?', icon: MapPin, action: 'addresses' },
          { label: 'Review your last order', sub: 'Tell us how the chocolates were!', icon: Trophy, action: 'orders' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveSection(item.action)}
            className="group flex items-center gap-5 p-5 glass-dark border border-[#3E2723]/50 rounded-2xl hover:border-[#D4AF37]/30 transition-all text-left"
          >
            <div className="w-12 h-12 bg-[#1A0F0B] border border-white/5 rounded-xl flex items-center justify-center text-[#FFF3E0]/40 group-hover:text-[#D4AF37] transition-all">
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#FFF3E0] group-hover:text-[#D4AF37] transition-all">{item.label}</p>
              <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-widest font-medium mt-1">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
