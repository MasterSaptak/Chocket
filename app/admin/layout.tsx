'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { canAccessManagerDashboard } from '@/lib/rbac';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, role } = useAuth();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkManagerRole = async () => {
      if (!user) {
        setIsCheckingRole(false);
        return;
      }

      try {
        // Check if the user has manager or super_admin role
        if (userData && canAccessManagerDashboard(userData.role)) {
          setIsManager(true);
        } else if (user.email?.toLowerCase() === 'burningsoulofdarkness@gmail.com') {
          // Bootstrap the super admin
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              name: user.displayName || 'Prime Admin',
              email: user.email,
              phone: '',
              role: 'primeadmin',
              status: 'active',
              profileImage: user.photoURL || '',
              createdAt: serverTimestamp(),
            });
          } else if (userDoc.data().role !== 'primeadmin' && userDoc.data().role !== 'manager') {
            await setDoc(userDocRef, { role: 'primeadmin' }, { merge: true });
          }
          setIsManager(true);
        } else {
          setIsManager(false);
          toast.error('Unauthorized access. Manager privileges required.');
        }
      } catch (error) {
        console.error('Error checking manager role:', error);
        toast.error('Failed to verify manager privileges.');
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (!loading) {
      checkManagerRole();
    }
  }, [user, userData, loading]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
          <p className="text-[#FFF3E0]/50 text-sm">Verifying manager access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0705] p-4">
        <div className="w-full max-w-md bg-[#1A0F0B] shadow-2xl border border-[#3E2723] rounded-2xl overflow-hidden">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-display font-bold text-[#D4AF37]">Manager Access</h2>
            <p className="text-[#FFF3E0]/50 text-sm">
              Please sign in with your authorized Google account to access the Chocket manager dashboard.
            </p>
            <div className="pt-6 space-y-3">
              <button
                onClick={handleLogin}
                className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg shadow-[#D4AF37]/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="w-full h-12 bg-[#2C1A12] text-[#FFF3E0] font-semibold rounded-xl hover:bg-[#3E2723] transition-colors border border-[#3E2723]"
              >
                Sign in with Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
