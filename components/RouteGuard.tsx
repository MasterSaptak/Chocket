'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert, Ban } from 'lucide-react';
import type { UserRole } from '@/types';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles, redirectTo = '/auth' }: RouteGuardProps) {
  const { user, userData, loading, isBanned } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
          <p className="text-[#FFF3E0]/60 text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="max-w-md w-full bg-[#1A0F0B] border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-red-400">Account Suspended</h2>
          <p className="text-[#FFF3E0]/60 text-sm leading-relaxed">
            Your account has been suspended. Please contact our support team for assistance.
          </p>
          <button
            onClick={() => {
              import('@/lib/auth').then(({ logout }) => logout());
              router.push('/auth');
            }}
            className="mt-4 px-6 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors font-semibold border border-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (userData && !allowedRoles.includes(userData.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="max-w-md w-full bg-[#1A0F0B] border border-[#3E2723] rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-[#D4AF37]">Access Denied</h2>
          <p className="text-[#FFF3E0]/60 text-sm leading-relaxed">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-[#D4AF37] text-[#1A0F0B] rounded-xl hover:bg-[#D4AF37]/90 transition-colors font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
