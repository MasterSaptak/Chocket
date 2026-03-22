'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2, Crown } from 'lucide-react';
import { canAccessSuperAdmin } from '@/lib/auth';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-[#FFF3E0]/50 text-sm">Verifying super admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="max-w-md w-full bg-[#1A0F0B] border border-purple-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-purple-400">Super Admin Access</h2>
          <p className="text-[#FFF3E0]/50 text-sm">Please sign in to access the super admin dashboard.</p>
          <button
            onClick={() => router.push('/auth')}
            className="mt-4 px-6 py-3 bg-purple-500/10 text-purple-400 rounded-xl font-semibold hover:bg-purple-500/20 transition-colors border border-purple-500/20"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (userData && !canAccessSuperAdmin(userData.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="max-w-md w-full bg-[#1A0F0B] border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-red-400">Access Denied</h2>
          <p className="text-[#FFF3E0]/50 text-sm">Only Prime Admins can access this dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-[#D4AF37] text-[#1A0F0B] rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
