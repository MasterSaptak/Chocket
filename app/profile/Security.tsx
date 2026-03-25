'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Mail, History, LogOut, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { toast } from 'sonner';

export default function Security() {
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset link sent to your email! 📧');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignOutAll = async () => {
    if (!window.confirm('This will end your current session and log you out. Proceed?')) return;
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-[#FFF3E0]">Account Security</h3>
          <p className="text-xs text-[#FFF3E0]/40 uppercase tracking-widest font-bold mt-1">Protect your artisan collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification Status Card */}
        <div className="glass-dark border border-[#3E2723]/30 rounded-3xl p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/5 rounded-2xl text-[#FFF3E0]/30 border border-white/5">
              <Mail className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${user?.emailVerified ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20 animate-pulse'}`}>
              {user?.emailVerified ? 'Full Access' : 'Limited Access'}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-display font-bold text-[#FFF3E0] mb-2 flex items-center gap-2">
              Email Verification
              {user?.emailVerified && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </h4>
            <p className="text-[#FFF3E0]/50 text-sm leading-relaxed mb-6">
              Your email address is <strong className="text-[#FFF3E0]">{user?.email}</strong>. 
              {user?.emailVerified 
                ? ' Your primary communication channel is verified and secured.' 
                : ' Please verify your email to unlock all features like order tracking and rewards.'}
            </p>
            {!user?.emailVerified && (
              <button 
                onClick={() => window.location.href = '/verify-email'}
                className="w-full py-3.5 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                Verify Now
              </button>
            )}
          </div>
        </div>

        {/* Password Reset Card */}
        <div className="glass-dark border border-[#3E2723]/30 rounded-3xl p-8 flex flex-col justify-between group">
          <div className="p-3 w-fit bg-white/5 rounded-2xl text-[#FFF3E0]/30 border border-white/5 mb-6 group-hover:border-[#D4AF37]/30 transition-all">
            <Key className="w-6 h-6 group-hover:text-[#D4AF37] transition-all" />
          </div>
          <div>
            <h4 className="text-xl font-display font-bold text-[#FFF3E0] mb-2">Change Password</h4>
            <p className="text-[#FFF3E0]/50 text-sm leading-relaxed mb-8">
              Want to update your password? Click the button below to receive a secure link via email. 
              We recommend using a strong, unique password for your Chocket account.
            </p>
            <button 
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="w-full py-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl text-xs font-bold uppercase tracking-widest border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Send Reset Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
