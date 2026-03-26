'use client';

import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { ProfileProvider } from './ProfileContext';
import ProfileSidebar from './Sidebar';
import CommandCenter from './CommandCenter';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0705] gap-4">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        <p className="text-[#FFF3E0]/40 uppercase tracking-[0.3em] font-bold text-xs">Accessing Command Center...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D0705] flex items-center justify-center p-6 text-center">
        <div className="glass-dark border border-[#3E2723] rounded-[48px] p-12 max-w-lg shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full blur-2xl group-hover:bg-red-500/10 transition-all duration-700" />
          
          <h2 className="text-4xl font-display font-bold text-[#FFF3E0] mb-6">Access Restricted</h2>
          <p className="text-[#FFF3E0]/50 mb-10 leading-relaxed text-lg italic">
            "Authorization is the bridge between a guest and a connoisseur. Please enter the artisan chambers."
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth" 
              className="gold-gradient text-[#1A0F0B] px-10 py-4 rounded-full font-bold shadow-xl border border-transparent flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Enter Chambers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/" 
              className="text-[#FFF3E0]/60 hover:text-[#FFF3E0] px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileProvider>
      <div className="min-h-screen bg-[#0D0705] py-10 md:py-20 relative overflow-hidden selection:bg-[#D4AF37] selection:text-[#1A0F0B]">
        {/* Visual Foundations */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#D4AF37]/[0.02] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#3E2723]/[0.1] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Mobile Mini-Nav (Sticky) */}
        <div className="lg:hidden sticky top-0 z-50 bg-[#0D0705]/80 backdrop-blur-xl border-b border-[#3E2723]/50 mb-6 -mx-6 px-6 py-4">
           <div className="flex items-center justify-between">
              <h1 className="text-xl font-display font-bold text-[#FFF3E0]">Command Center</h1>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center font-bold text-[#1A0F0B] text-xs">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
           </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row gap-10"
          >
            {/* Navigational Wing */}
            <ProfileSidebar />

            {/* Tactical Deployment Center */}
            <div id="command-center" className="flex-1 min-w-0 scroll-mt-24">
               <CommandCenter />
            </div>
          </motion.div>
        </div>
      </div>
    </ProfileProvider>
  );
}
