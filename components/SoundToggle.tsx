'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

export function SoundToggle() {
  const [isOn, setIsOn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = useCallback(() => {
    setIsOn(prev => !prev);
    // Play a soft click if toggling on
    if (!isOn) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } catch { /* silent fail */ }
    }
  }, [isOn]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        onClick={toggle}
        className="relative p-2.5 rounded-full glass-dark border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOn ? 'Mute sound' : 'Enable sound'}
      >
        <AnimatePresence mode="wait">
          {isOn ? (
            <motion.div
              key="on"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <VolumeX className="w-4 h-4 text-[#FFF3E0]/50" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound wave indicator */}
        {isOn && (
          <div className="absolute -right-1 -top-1 flex items-end gap-[2px] h-3">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="sound-bar"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 px-3 py-1.5 rounded-lg bg-[#1A0F0B] border border-[#3E2723] text-[10px] text-[#FFF3E0]/70 whitespace-nowrap"
          >
            {isOn ? 'Sound On' : 'Sound Off'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
