'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsCheckingRole(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else if (user.email === 'BUrningSOUlofDarkness@gmail.com' && user.emailVerified) {
          // Bootstrap the first admin
          await setDoc(userDocRef, {
            email: user.email,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          toast.error('Unauthorized access. Admin privileges required.');
          auth.signOut();
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        toast.error('Failed to verify admin privileges.');
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md bg-card shadow-xl border border-primary/10 rounded-2xl overflow-hidden">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-primary">Admin Access</h2>
            <p className="text-muted-foreground">
              Please sign in with your authorized Google account to access the Chocket admin dashboard.
            </p>
            <div className="pt-6">
              <button 
                onClick={handleLogin}
                className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
