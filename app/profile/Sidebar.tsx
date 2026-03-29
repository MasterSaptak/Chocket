'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  User, MapPin, CreditCard, ShoppingBag, Heart, Eye, 
  Shield, Key, History, Bell, Globe, FileText, 
  RotateCcw, LogOut, ChevronRight, LayoutDashboard,
  Crown, Star, Award, Store
} from 'lucide-react';
import { useProfile } from './ProfileContext';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getRoleDisplayName, getRoleColor, getDashboardPath } from '@/lib/rbac';
import Link from 'next/link';

export default function ProfileSidebar() {
  const { activeSection, setActiveSection } = useProfile();
  const { user, userData, role } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out safely');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    isExternal?: boolean;
    href?: string;
  }

  interface MenuGroup {
    title: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      title: 'Command Center',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'rewards', label: 'Rewards & Tiers', icon: Crown },
      ]
    },
    {
      title: 'My Account',
      items: [
        { id: 'profile', label: 'Profile Info', icon: User },
        { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
      ]
    },
    {
      title: 'Activity',
      items: [
        { id: 'orders', label: 'Order History', icon: ShoppingBag },
        { id: 'wishlist', label: 'My Wishlist', icon: Heart },
        { id: 'recent', label: 'Recently Viewed', icon: Eye },
      ]
    },
    {
      title: 'Security',
      items: [
        { id: 'security', label: 'Account Security', icon: Shield },
        { id: 'sessions', label: 'Active Sessions', icon: History },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'settings', label: 'Notifications', icon: Bell },
        { id: 'localization', label: 'Language & Currency', icon: Globe },
      ]
    },
    {
      title: 'Legal',
      items: [
        { id: 'terms', label: 'Terms of Service', icon: FileText, isExternal: true, href: '/terms' },
        { id: 'privacy', label: 'Privacy Policy', icon: Shield, isExternal: true, href: '/privacy' },
        { id: 'refunds', label: 'Refund Policy', icon: RotateCcw, isExternal: true, href: '/refunds' },
      ]
    }
  ];

  const getTierIcon = (tier: string = 'bronze') => {
    switch(tier) {
      case 'gold': return <Crown className="w-5 h-5 text-[#D4AF37]" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-300" />;
      default: return <Award className="w-5 h-5 text-[#B8860B]" />;
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-4 md:p-6 lg:sticky lg:top-28 shadow-2xl space-y-6 md:space-y-8 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto hide-scrollbar">
        
        {/* User Snapshot Card */}
        <div className="relative group p-6 bg-[#1A0F0B] rounded-[32px] border border-[#D4AF37]/10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-[#1A0F0B] text-xl border-2 ${getRoleColor(role).border} bg-gradient-to-br ${getRoleColor(role).gradient} shadow-lg shrink-0`}>
              {(userData?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#FFF3E0] font-bold text-base truncate pr-2">
                {userData?.name || user?.displayName || 'Chocket Guest'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[8px] uppercase tracking-[0.1em] font-black px-2 py-0.5 rounded border shadow-sm ${getRoleColor(role).bg} ${getRoleColor(role).text} ${getRoleColor(role).border} shrink-0`}>
                  {getRoleDisplayName(role)}
                </span>
                <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase shrink-0">
                  {userData?.tier || 'Bronze'} Tier
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between px-4 py-3 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
             <div className="flex items-center gap-2">
               <span className="text-sm">🍫</span>
               <span className="text-sm font-bold text-[#D4AF37]">{(userData?.choco_points || 0).toLocaleString()}</span>
             </div>
             <div className="h-4 w-[1px] bg-[#D4AF37]/20" />
             <div className="flex items-center gap-2">
               {getTierIcon(userData?.tier)}
               <span className="text-[10px] font-bold text-[#FFF3E0]/60 uppercase tracking-widest">Active</span>
             </div>
          </div>

          {/* Quick Access Dashboard Buttons */}
          {role && role !== 'buyer' && (
            <div className="mt-5 flex flex-col gap-2.5">
              {role === 'primeadmin' && (
                <>
                  <Link 
                    href="/superadmin/dashboard"
                    className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-purple-500/20 active:scale-[0.98] transition-all group/dash"
                  >
                    <Crown className="w-4 h-4" />
                    Prime Admin
                    <ChevronRight className="w-3.5 h-3.5 group-hover/dash:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/admin"
                    className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500/20 active:scale-[0.98] transition-all group/dash"
                  >
                    <Shield className="w-4 h-4" />
                    Manager Panel
                    <ChevronRight className="w-3.5 h-3.5 group-hover/dash:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
              {role === 'manager' && (
                <Link 
                  href="/admin"
                  className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-500/20 active:scale-[0.98] transition-all group/dash"
                >
                  <Shield className="w-4 h-4" />
                  Manager Panel
                  <ChevronRight className="w-3.5 h-3.5 group-hover/dash:translate-x-1 transition-transform" />
                </Link>
              )}
              {role === 'seller' && (
                <Link 
                  href="/seller/dashboard"
                  className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-500/20 active:scale-[0.98] transition-all group/dash"
                >
                  <Store className="w-4 h-4" />
                  Seller Dashboard
                  <ChevronRight className="w-3.5 h-3.5 group-hover/dash:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Navigation */}
        <div className="grid grid-cols-1 gap-6 md:block space-y-0 md:space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={group.title} className="space-y-3">
              <h4 className="px-4 text-[10px] uppercase tracking-[0.2em] text-[#FFF3E0]/30 font-bold flex items-center gap-2">
                <span className="w-1 h-1 bg-[#D4AF37]/40 rounded-full" />
                {group.title}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-1 gap-2 md:gap-1 px-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.isExternal && item.href) {
                          router.push(item.href);
                        } else {
                          setActiveSection(item.id);
                          // Scroll to content on mobile
                          if (window.innerWidth < 1024) {
                            document.getElementById('command-center')?.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }
                      }}
                      className={`w-full group/btn flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                        isActive 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 shadow-sm shadow-[#D4AF37]/10' 
                          : 'text-[#FFF3E0]/50 hover:bg-white/5 hover:text-[#FFF3E0] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${isActive ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/30'}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'translate-x-1' : 'opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-[#3E2723]/50">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 bg-red-400/5 hover:bg-red-400/15 border border-red-400/10 transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
