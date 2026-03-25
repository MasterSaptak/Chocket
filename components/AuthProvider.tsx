'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { ChocketUser, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  userData: ChocketUser | null;
  loading: boolean;
  role: UserRole | null;
  isBanned: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  role: null,
  isBanned: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<ChocketUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth State Changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    console.log('🚀 Auth Listener Initialized');

    // Handle Redirect Result for Mobile Google Sign-In
    console.log('🔍 Checking for Redirect Auth result...');
    getRedirectResult(auth).then(async (result: any) => {
      if (result && result.user) {
        console.log('✅ Redirect Auth Result Found:', result.user.uid);
        // Double check if user document exists, if not create it
        const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          console.log('🌱 Creating missing user profile from redirect...');
          await setDoc(userRef, {
            uid: result.user.uid,
            name: result.user.displayName || 'Chocolate Lover',
            email: result.user.email || '',
            phone: '',
            role: 'buyer',
            status: 'active',
            isVerified: result.user.emailVerified || false,
            createdAt: serverTimestamp(),
            choco_points: 0,
            total_points_earned: 0,
            tier: 'bronze'
          });
        }
      } else {
        console.log('ℹ️ No Redirect Result found.');
      }
    }).catch((error: any) => {
      console.error("❌ Redirect Auth Error:", error);
      // Log specific error codes for debugging
      if (error.code) console.error(`Error Code: ${error.code}`);
      setLoading(false);
    });

    // Fallback: Extended to 15s for mobile reliability
    const safetyTimeout = setTimeout(() => {
      console.log('🕒 Loading Safety Timeout Reached (15s)');
      setLoading(false);
    }, 15000);

    // Initial log of current environment
    console.log(`🌐 Application URL: ${window.location.href}`);
    console.log(`📱 User Agent: ${navigator.userAgent}`);

    return () => {
      unsubscribeAuth();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Listen to Firestore user document for real-time role/status updates
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setUserData({ ...snap.data(), uid: snap.id } as ChocketUser);
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to user doc:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeUser();
  }, [user]);

  const role = userData?.role || null;
  const isBanned = userData?.status === 'banned';

  return (
    <AuthContext.Provider value={{ user, userData, loading, role, isBanned }}>
      {children}
    </AuthContext.Provider>
  );
}
