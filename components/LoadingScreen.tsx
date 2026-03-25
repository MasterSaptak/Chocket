'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Very fast progress
        const increment = prev < 60 ? 5 : prev < 85 ? 10 : 15;
        return Math.min(prev + increment, 100);
      });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0705]"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-10 relative"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-[#FFF3E0]">
              Chocket<span className="text-[#D4AF37]">.</span>
            </h1>
            {/* Gold dust around logo */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                style={{
                  top: `${30 + Math.sin(i * 1.2) * 30}%`,
                  left: `${-10 + i * 25}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -20, -40],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>

          {/* Progress bar */}
          <div className="w-64 md:w-80 relative">
            <div className="h-1.5 bg-[#2C1A12] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3E2723, #D4AF37, #F9F295)',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Label */}
            <div className="flex justify-between items-center mt-3">
              <motion.span
                className="text-[#FFF3E0]/40 text-xs tracking-[0.2em] uppercase choco-loader-text"
              >
                Melting perfection...
              </motion.span>
              <span className="text-[#D4AF37] text-xs font-medium">{progress}%</span>
            </div>
          </div>

          {/* Chocolate emoji */}
          <motion.div
            className="absolute bottom-12 text-2xl"
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🍫
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
