'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight, ChevronLeft, Shield, Package } from 'lucide-react';
import { toast } from 'sonner';
import { registerWithEmail, loginWithEmail, signInWithGoogle, getDashboardPath, getUserRole, logout } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [view, setView] = useState<'auth' | 'portals'>('auth');

  // Unified Redirection Logic
  useEffect(() => {
    if (user && role) {
      if (!user.emailVerified && role !== 'primeadmin' && role !== 'admin') {
        router.push('/verify-email');
      }
    } else if (user && !role && !authLoading) {
      // Self-healing mechanism: If Google Auth popup promise hangs completely due to Next.js COOP bugs,
      // auth propagates via indexedDB causing user=truthy, but createUserDocument never ran.
      const timer = setTimeout(async () => {
        try {
          const manualRole = await getUserRole(user.uid);
          if (!manualRole) {
            console.log('Self-healing missing profile...');
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              name: user.displayName || 'Chocolate Lover',
              email: user.email || '',
              phone: '',
              role: 'buyer',
              status: 'active',
              isVerified: user.emailVerified || false,
              createdAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err: any) {
          console.error('Fast-heal error:', err);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, role, router, authLoading]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, name, phone);
        toast.success('Account created! Please verify your email.');
        router.push('/verify-email');
      } else {
        const firebaseUser = await loginWithEmail(email, password);
        const userRole = await getUserRole(firebaseUser.uid);

        if (!firebaseUser.emailVerified && userRole !== 'primeadmin' && userRole !== 'admin') {
          toast.error('Please verify your email.');
          router.push('/verify-email');
          setIsLoading(false);
          return;
        }

        toast.success('Welcome back! 🍫');
        setIsLoading(false);
      }
    } catch (error: any) {
      let message = error.message || 'Authentication failed.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (error.message?.includes('offline')) {
        message = 'You appear to be offline. Please check your connection.';
      }
      
      toast.error(message);
      setIsLoading(false);
      await logout().catch(() => {});
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      const userRole = await getUserRole(firebaseUser.uid);
      
      if (!firebaseUser.emailVerified && userRole !== 'primeadmin' && userRole !== 'admin') {
        router.push('/verify-email');
        setIsLoading(false);
        return;
      }
      
      toast.success('Welcome back! 🍫');
      setIsLoading(false);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        let message = error.message || 'Google sign-in failed.';
        if (error.code === 'auth/popup-blocked') {
          message = 'Sign-in popup was blocked. Please allow popups.';
        } else if (error.message?.includes('offline')) {
          message = 'You appear to be offline. Please check your connection.';
        }
        toast.error(message);
      }
      setIsLoading(false);
      await logout().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0705] relative overflow-hidden px-4 py-8">
      {/* Simple Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3E2723]/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-[#FFF3E0]">Chocket<span className="text-[#D4AF37]">.</span></h1>
          <p className="text-[#FFF3E0]/50 text-sm mt-2 font-medium tracking-wide">Premium Chocolate Experience</p>
        </div>

        <AnimatePresence mode="wait">
          {authLoading ? (
            <motion.div
              key="loading-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl p-10 shadow-2xl text-center"
            >
              <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#FFF3E0]">Syncing Profile...</h2>
              <p className="text-[#FFF3E0]/40 text-sm mt-2">Connecting to your sweet dashboard.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 text-xs text-[#D4AF37] hover:underline uppercase tracking-widest font-bold"
              >
                Click here if stuck
              </button>
            </motion.div>
          ) : user ? (
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                <User className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#FFF3E0] mb-2">Welcome Back!</h2>
              <p className="text-[#FFF3E0]/60 text-sm mb-8">
                You are successfully signed in as <strong className="text-[#D4AF37]">{user.displayName || user.email?.split('@')[0]}</strong>.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push(getDashboardPath(role || 'buyer'))}
                  className="py-4 px-8 bg-[#D4AF37] text-[#1A0F0B] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#F9F295] transition-all hover:scale-105 active:scale-95"
                >
                  Proceed to Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : view === 'auth' ? (
            <motion.div
              key="auth-card"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex border-b border-[#3E2723]">
                {['login', 'signup'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMode(tab as 'login' | 'signup')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${mode === tab ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/30 hover:text-[#FFF3E0]/60'
                      } relative`}
                  >
                    {tab === 'login' ? 'Sign In' : 'Sign Up'}
                    {mode === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {mode === 'signup' && (
                    <>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className="auth-input" />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20" />
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="auth-input" />
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="auth-input" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/20" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="auth-input pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFF3E0]/20 hover:text-[#D4AF37]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#D4AF37] text-[#1A0F0B] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#F9F295] transition-colors disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>

                {!user && (
                  <>
                    <div className="my-6 flex items-center gap-4 text-[#FFF3E0]/10">
                      <div className="flex-1 h-px bg-current" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">or</span>
                      <div className="flex-1 h-px bg-current" />
                    </div>

                    <button onClick={handleGoogleAuth} disabled={isLoading} className="w-full py-3.5 border border-[#3E2723] rounded-xl flex items-center justify-center gap-3 text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-50">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Continue with Google
                    </button>
                  </>
                )}

                <div className="mt-8 pt-6 border-t border-[#3E2723] text-center space-y-4">
                  <button onClick={() => setView('portals')} className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
                    Staff & Business Portals
                  </button>
                  <div className="block pt-2">
                    <button
                      onClick={() => {
                        if (confirm('Clear session and reload?')) {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="text-[10px] text-red-400/30 hover:text-red-400/60 uppercase tracking-widest"
                    >
                      Reset App Session
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="portals-card"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl p-8 shadow-2xl"
            >
              <button onClick={() => setView('auth')} className="flex items-center gap-1 text-xs text-[#FFF3E0]/30 hover:text-[#FFF3E0] mb-6">
                <ChevronLeft className="w-4 h-4" /> Back to Store
              </button>
              <h2 className="text-xl font-display font-bold text-[#FFF3E0] mb-6">Access Portals</h2>
              <div className="grid gap-4">
                {[
                  { role: 'primeadmin', label: 'Prime Admin', desc: 'System Master Control', icon: Shield, color: 'text-purple-400' },
                  { role: 'seller', label: 'Seller Portal', desc: 'Product Management', icon: Package, color: 'text-emerald-400' },
                  { role: 'admin', label: 'Admin Panel', desc: 'Store Moderation', icon: Shield, color: 'text-blue-400' }
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => { setView('auth'); setMode('login'); toast.info(`${item.label} login active`); }}
                    className="flex items-center gap-4 p-4 bg-[#0D0705]/60 border border-[#3E2723] rounded-xl hover:border-[#D4AF37] transition-all text-left"
                  >
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <div>
                      <h4 className="font-bold text-sm text-[#FFF3E0]">{item.label}</h4>
                      <p className="text-[10px] text-[#FFF3E0]/30 uppercase font-bold tracking-wider">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .auth-input {
            width: 100%;
            padding: 0.875rem 1rem 0.875rem 2.75rem;
            background: rgba(13, 7, 5, 0.6);
            border: 1px solid #3E2723;
            border-radius: 0.75rem;
            color: #FFF3E0;
            font-size: 0.875rem;
            transition: all 0.3s;
        }
        .auth-input:focus {
            outline: none;
            border-color: #D4AF37;
            background: rgba(13, 7, 5, 0.8);
        }
      `}</style>
    </div>
  );
}
