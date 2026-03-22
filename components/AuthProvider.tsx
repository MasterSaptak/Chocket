'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
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

    // Fallback: If Firebase takes too long, stop loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

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
