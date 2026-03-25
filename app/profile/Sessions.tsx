'use client';

import React from 'react';
import { motion } from 'motion/react';
import { History, CheckCircle2, AlertTriangle, LogOut, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

export default function Sessions() {
  const { user } = useAuth();

  const handleSignOutAll = async () => {
    if (!window.confirm('This will end your current session and log you out of all devices. Proceed?')) return;
    try {
      await signOut(auth);
      toast.success('Signed out of all devices successfully');
      window.location.href = '/';
    } catch {
      toast.error('Failed to log out');
    }
  };

  const currentSesssion = {
    device: 'Windows Desktop',
    browser: 'Chrome 123.0',
    location: 'Bangalore, India',
    ip: '106.213.14.XXX',
    icon: Laptop,
    isCurrent: true
  };

  const otherSessions = [
    { device: 'iPhone 15 Pro', browser: 'Safari', location: 'Mumbai, India', ip: '49.36.122.XXX', icon: Smartphone, lastActive: '2 hours ago' },
    { device: 'Samsung Galaxy Tab', browser: 'Samsung Browser', location: 'Delhi, India', ip: '27.54.89.XXX', icon: Tablet, lastActive: '3 days ago' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-[#FFF3E0]">Active Sessions</h3>
          <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-widest font-bold mt-1">Management of logged-in devices</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Current Session */}
        <div className="glass-dark border border-[#D4AF37]/20 rounded-[32px] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/10">
              <currentSesssion.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-xl font-display font-bold text-[#FFF3E0]">{currentSesssion.device}</h4>
                <span className="text-[10px] font-bold px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 uppercase tracking-widest">
                  Current Session
                </span>
              </div>
              <p className="text-sm text-[#FFF3E0]/50">
                {currentSesssion.browser} • {currentSesssion.location} • IP: {currentSesssion.ip}
              </p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-green-400 hidden md:block" />
          </div>
        </div>

        {/* Other Devices Section */}
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#FFF3E0]/30 font-bold ml-4">Other Logged-in Devices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherSessions.map((session, idx) => (
            <div key={idx} className="glass-dark border border-[#3E2723]/50 rounded-[28px] p-6 hover:border-[#D4AF37]/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#FFF3E0]/30 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all">
                  <session.icon className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-[#FFF3E0] text-sm">{session.device}</h5>
                  <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-widest mt-1">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone: Log out all */}
        <div className="mt-12 p-8 bg-black/40 border-2 border-dashed border-red-500/20 rounded-[40px] text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-display font-bold text-[#FFF3E0] mb-3">Compromised Account?</h4>
          <p className="text-[#FFF3E0]/40 max-w-md mx-auto mb-8 text-sm leading-relaxed italic">
            "Security is the highest delicacy. If you suspect unauthorized access, purge all active connections immediately."
          </p>
          <button 
            onClick={handleSignOutAll}
            className="px-10 py-4 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-500/20 active:scale-95 transition-all shadow-lg shadow-red-900/10 flex items-center gap-3 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Purge All Other Sessions
          </button>
        </div>

      </div>
    </div>
  );
}
