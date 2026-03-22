'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, RefreshCw, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
import { auth, db } from '@/lib/firebase';
import { sendEmailVerification, signOut, applyActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { getDashboardPath } from '@/lib/auth';
import { useCallback } from 'react';

function VerifyEmailContent() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const handleVerificationSuccess = useCallback(async () => {
    if (!user) return;
    try {
      console.log('Email verified! Updating Firestore and redirecting...');
      // Force token refresh so Security Rules see the new verified claim immediately
      await user.getIdToken(true);
      
      // Sync with Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isVerified: true });
      
      toast.success('Email verified successfully! 🍫');
      const targetPath = role ? getDashboardPath(role) : '/';
      console.log('Redirecting to:', targetPath);
      router.push(targetPath);
    } catch (err) {
      console.error('Failed to update firestore:', err);
      // Fallback: still redirect if auth is verified
      const targetPath = role ? getDashboardPath(role) : '/';
      router.push(targetPath);
    } finally {
      setIsProcessingCode(false);
    }
  }, [user, role, router]);

  // Process manual email link code if present
  useEffect(() => {
    if (oobCode && !isProcessingCode) {
      setIsProcessingCode(true);
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            handleVerificationSuccess();
          } else {
             // Not logged in but verified, send them to login
             toast.success('Email verified successfully! Please log in.');
             router.push('/auth');
          }
        })
        .catch((err) => {
          console.error("Action code failed", err);
          toast.error("Verification link has expired or is invalid.");
          setIsProcessingCode(false);
        });
    }
  }, [oobCode, router]);

  // Auto-redirect if verified
  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        handleVerificationSuccess();
      }
    }
    // Redirect to auth if not logged in at all
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router, handleVerificationSuccess]);

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Optional auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !user.emailVerified) {
        user.reload().then(() => {
          if (auth.currentUser?.emailVerified) {
            handleVerificationSuccess();
          }
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);



  const handleVerifiedCheck = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      await user.reload(); // Refresh Auth state
      if (auth.currentUser?.emailVerified) {
        await handleVerificationSuccess();
      } else {
        toast.error('Email is not verified yet. Please check your inbox or spam folder.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check verification status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user) return;
    if (cooldown > 0) return;
    
    setIsResending(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      
      // Fallback to Firebase default if API key missing
      if (!res.ok && data.error?.includes('Resend API key missing')) {
        const actionCodeSettings = {
          url: typeof window !== 'undefined' ? window.location.origin + '/verify-email' : 'http://localhost:3000/verify-email',
          handleCodeInApp: false,
        };
        await sendEmailVerification(user, actionCodeSettings);
        toast.success('Verification email resent using default Firebase sender!');
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to resend custom email.');
      } else {
        toast.success('Premium verification email resent successfully! 🍫');
      }
      setCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      // Handle too-many-requests or other errors
      if (error.code === 'auth/too-many-requests') {
        toast.error('We have blocked all requests from this device due to unusual activity. Try again later.');
        setCooldown(120);
      } else {
        toast.error(error.message || 'Failed to resend verification email.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth');
  };

  if (loading || isProcessingCode) {
    return (
      <div className="min-h-screen bg-[#0D0705] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#D4AF37] font-medium font-display text-lg animate-pulse">
          Verifying your sweet account...
        </p>
      </div>
    );
  }

  // If we ended up here but user is somehow verified already, don't return null which blanks the screen.
  // Instead, just politely ask them to wait to be redirected or show a success check mark.
  if (user?.emailVerified && !isProcessingCode) {
    return (
      <div className="min-h-screen bg-[#0D0705] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#FFF3E0]">Successfully Verified</h2>
          <p className="text-[#FFF3E0]/70 mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0705] relative overflow-hidden px-4 py-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[200px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-3xl shadow-2xl p-8 text-center border-t-4 border-t-[#D4AF37]">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <h1 className="text-2xl font-bold text-[#FFF3E0] mb-2 font-display">
            Verify your email
          </h1>
          <p className="text-[#FFF3E0]/70 mb-2">
            We sent a verification email to
          </p>
          <div className="bg-[#0D0705] py-2 px-4 rounded-lg inline-block text-[#D4AF37] font-medium mb-6">
            {user?.email}
          </div>
          
          <div className="bg-[#2D1A11]/30 border border-[#3E2723] rounded-xl p-4 mb-8">
            <p className="text-sm text-[#FFF3E0]/80">
              Check your email and click the verification link before continuing to access your Chocket dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={handleVerifiedCheck}
              disabled={isRefreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  I have verified
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleResendEmail}
              disabled={isResending || cooldown > 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#0D0705]/60 border border-[#3E2723] text-[#FFF3E0] font-semibold rounded-xl hover:bg-[#1A0F0B] hover:border-[#D4AF37]/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isResending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : cooldown > 0 ? (
                <span>Resend available in {cooldown}s</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Email
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#3E2723] text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-[#FFF3E0]/40 hover:text-[#FFF3E0] transition-colors flex items-center gap-1 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign in with another account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0705] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#D4AF37] font-medium font-display text-lg animate-pulse">
          Loading verify page...
        </p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
