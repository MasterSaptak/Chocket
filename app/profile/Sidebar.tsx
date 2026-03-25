'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  User, MapPin, CreditCard, ShoppingBag, Heart, Eye, 
  Shield, Key, History, Bell, Globe, FileText, 
  RotateCcw, LogOut, ChevronRight, LayoutDashboard,
  Crown, Star, Award
} from 'lucide-react';
import { useProfile } from './ProfileContext';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfileSidebar() {
  const { activeSection, setActiveSection } = useProfile();
  const { user, userData } = useAuth();
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
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-6 sticky top-28 shadow-2xl space-y-8 max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar">
        
        {/* User Snapshot Card */}
        <div className="relative group p-4 bg-[#1A0F0B] rounded-2xl border border-[#D4AF37]/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center font-bold text-[#1A0F0B] text-lg border-2 border-[#D4AF37]/20">
              {(userData?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[#FFF3E0] font-bold text-sm truncate max-w-[140px]">
                {userData?.name || user?.displayName || 'Chocket Guest'}
              </p>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-1.5">
                <div className="flex items-center gap-1.5">
                  {getTierIcon(userData?.tier)}
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                    {userData?.tier || 'Bronze'} Member
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
                  <span className="text-[10px]">🍫</span>
                  <span className="text-[10px] font-bold text-[#D4AF37]">{(userData?.choco_points || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <div className="space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={group.title} className="space-y-2">
              <h4 className="px-4 text-[10px] uppercase tracking-[0.2em] text-[#FFF3E0]/30 font-bold">
                {group.title}
              </h4>
              <div className="grid gap-1">
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
