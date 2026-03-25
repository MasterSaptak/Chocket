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
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    // Handle Redirect Result for Mobile Google Sign-In
    getRedirectResult(auth).then(async (result: any) => {
      if (result && result.user) {
        // Double check if user document exists, if not create it
        const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
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
      }
    }).catch((error: any) => {
      console.error("Redirect Auth Error:", error);
      setLoading(false);
    });

    // Fallback: If Firebase takes too long, stop loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

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
