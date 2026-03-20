'use client';

import { useState, useEffect } from 'react';
import { Download, Info, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Polyfill/Type definition for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [os, setOs] = useState<'ios' | 'android' | 'windows' | 'mac' | 'other' | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (/android/.test(userAgent)) {
      setOs('android');
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setOs('mac');
    } else if (/windows/.test(userAgent)) {
      setOs('windows');
    } else {
      setOs('other');
    }

    // Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) return null; // Already installed

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      // If dismisses, we can keep the deferredPrompt for later
    } else {
      // Fallback: show instructions
      setShowInstructions(true);
    }
  };

  const getInstructions = () => {
    switch (os) {
      case 'ios':
        return (
          <div className="flex flex-col items-center gap-3 text-sm text-center">
            <p>To install on iOS:</p>
            <div className="flex flex-col items-center justify-center gap-2 bg-white/10 px-4 py-3 rounded-lg w-full">
              <div className="flex items-center gap-2">
                <span>1. Tap the</span> <Share className="w-5 h-5 text-blue-400" /> <span>Share button</span>
              </div>
              <div className="flex items-center gap-2">
                <span>2. Select</span> <PlusSquare className="w-5 h-5" /> <span>Add to Home Screen</span>
              </div>
            </div>
          </div>
        );
      case 'android':
        return (
          <div className="flex flex-col items-center gap-3 text-sm text-center">
            <p>To install on Android:</p>
            <div className="bg-white/10 px-4 py-3 rounded-lg w-full">
              Wait for the prompt above or tap the menu (⋮) in your browser and select <br />
              <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
            </div>
          </div>
        );
      case 'windows':
      case 'mac':
      default:
        return (
          <div className="flex flex-col items-center gap-3 text-sm text-center">
            <p>To install on Desktop:</p>
            <div className="bg-white/10 px-4 py-3 rounded-lg w-full">
              Look for the install icon <Download className="inline w-4 h-4 mx-1" /> in your browser's address bar, or find "Install App" in the browser menu.
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="group relative flex items-center justify-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/90 font-medium text-sm md:text-base hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 z-10"
      >
        <Download className="w-5 h-5 mr-2 group-hover:animate-bounce text-[#D4AF37]" />
        Install App
      </button>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] p-6 rounded-2xl bg-[#0D0705] border border-[#3E2723] shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-[#FFF3E0]/80"
            >
              <button
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 rounded-full bg-[#1A0F0B] border border-[#3E2723] flex items-center justify-center mb-3">
                  <Info className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-white text-lg">Install Chocket</h3>
              </div>
              
              {getInstructions()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
