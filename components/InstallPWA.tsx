'use client';

import { useState } from 'react';
import { Download, Info, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from './PWAProvider';

export function InstallPWA() {
  const { isStandalone, os, install, canInstall } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isStandalone || !canInstall) return null;

  const handleInstallClick = async () => {
    const outcome = await install();
    if (!outcome) {
      // Prompt not triggered by install function (likely iOS or missing event)
      setShowInstructions(true);
    }
  };

  const getInstructions = () => {
    switch (os) {
      case 'ios':
        return (
          <div className="flex flex-col items-center gap-4 text-sm text-center">
            <p className="text-[#FFF3E0]/80">To install on your iPhone:</p>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3 bg-[#1A0F0B] p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#1A0904] flex items-center justify-center text-blue-400">
                  <Share className="w-4 h-4" />
                </div>
                <span className="text-xs text-left">1. Tap the Share button in Safari</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1A0F0B] p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#1A0904] flex items-center justify-center text-[#D4AF37]">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span className="text-xs text-left">2. Select &apos;Add to Home Screen&apos;</span>
              </div>
            </div>
            <p className="text-[10px] text-[#FFF3E0]/40 italic">This ensures a premium, full-screen chocolate experience.</p>
          </div>
        );
      case 'android':
        return (
          <div className="flex flex-col items-center gap-4 text-sm text-center">
            <p className="text-[#FFF3E0]/80">To install on your Android device:</p>
            <div className="bg-[#1A0F0B] p-4 rounded-xl border border-white/5 w-full text-xs text-left leading-relaxed">
              Tap the browser menu <span className="font-bold text-[#D4AF37]">(⋮)</span> and select <br />
              <strong className="text-white">&quot;Install app&quot;</strong> or <strong className="text-white">&quot;Add to Home screen&quot;</strong>.
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4 text-sm text-center">
            <p className="text-[#FFF3E0]/80">To install Chocket on Desktop:</p>
            <div className="bg-[#1A0F0B] p-4 rounded-xl border border-white/5 w-full text-xs text-left">
              Look for the install icon <Download className="inline w-4 h-4 mx-1 text-[#D4AF37]" /> in your address bar, or find <strong className="text-white">&quot;Install App&quot;</strong> in your browser settings.
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2, type: 'spring', damping: 20 }}
        className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-40"
      >
        <button
          onClick={handleInstallClick}
          className="group relative flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-[#1A0F0B] border border-[#D4AF37]/40 text-[#FFF3E0] font-medium text-xs md:text-sm shadow-2xl hover:bg-[#2C1A12] hover:border-[#D4AF37] transition-all duration-300 gold-glow-hover overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <Smartphone className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
          Get App Experience
        </button>
      </motion.div>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[360px] p-8 rounded-3xl bg-[#0D0705] border border-[#3E2723] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-[#FFF3E0]"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A0F0B] to-[#2C1A12] border border-[#3E2723] flex items-center justify-center mb-4 shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center font-bold text-[#1A0F0B] text-xl">
                    C
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-center">Experience Chocket</h3>
                <p className="text-sm text-[#FFF3E0]/40 mt-1">Enjoy our premium app experience</p>
              </div>
              
              <div className="space-y-6">
                {getInstructions()}
                
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
