'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from './ProfileContext';
import ProfileDashboard from './Dashboard';
import ProfileInfo from './ProfileInfo';
import Addresses from './Addresses';
import Security from './Security';
import Sessions from './Sessions';
import Preferences from './Preferences';
import Activity from './Activity';
import Rewards from './Rewards';
import { Loader2, Construction } from 'lucide-react';

export default function CommandCenter() {
  const { activeSection } = useProfile();

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return <ProfileDashboard />;
      case 'profile': return <ProfileInfo />;
      case 'addresses': return <Addresses />;
      case 'security': return <Security />;
      case 'sessions': return <Sessions />;
      case 'rewards': return <Rewards />;
      case 'settings':
      case 'localization': return <Preferences />;
      case 'orders':
      case 'wishlist':
      case 'recent': return <Activity />;
      default: return (
        <div className="flex flex-col items-center justify-center py-32 glass-dark border border-dashed border-[#3E2723] rounded-[40px] text-center">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] mb-6 border border-[#D4AF37]/20">
            <Construction className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-display font-bold text-[#FFF3E0]">Coming Soon</h3>
          <p className="text-[#FFF3E0]/40 mt-2 max-w-sm mx-auto leading-relaxed">
            We are hand-crafting this section of your <strong className="text-[#D4AF37]">Command Center</strong> to ensure the highest premium quality.
          </p>
          <div className="mt-8 flex items-center gap-3 px-6 py-2 bg-[#D4AF37]/5 rounded-full border border-[#D4AF37]/10">
            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">Artisan Module in Production</span>
          </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="pb-20"
      >
        {renderSection()}
      </motion.div>
    </AnimatePresence>
  );
}
