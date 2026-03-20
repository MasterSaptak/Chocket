'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-4 max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <Download className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Install Chocket App</p>
              <p className="text-xs text-white/60">For a faster, better experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
