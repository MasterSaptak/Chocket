import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { ChocketUser, UserRole } from '@/types';

const googleProvider = new GoogleAuthProvider();

// ===== REGISTER WITH EMAIL =====
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Create Firestore user document (default role: buyer)
  await createUserDocument(cred.user, { name, phone });

  // Send email verification using Custom Backend API
  try {
    const idToken = await cred.user.getIdToken();

    // Using absolute URL if in server context, relative if strictly in browser window
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/send-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    // Fallback to Firebase Default if Resend Key is missing
    if (!res.ok && data.error?.includes('Resend API key missing')) {
      console.warn("Resend API key missing. Falling back to default Firebase sender...");
      const actionCodeSettings = {
        url: `${baseUrl}/verify-email`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(cred.user, actionCodeSettings);
    } else if (!res.ok) {
      console.error("Custom Email API Failed:", data.error);
      // Fallback just in case
      const actionCodeSettings = {
        url: `${baseUrl}/verify-email`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(cred.user, actionCodeSettings);
    }
  } catch (e: any) {
    console.error("Failed to send verification email:", e);
    await signOut(auth);
    throw e;
  }

  // Redirect to verify-email page is handled by frontend (auth state listener)

  return cred.user;
}

// ===== LOGIN WITH EMAIL =====
export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Enforce strict email verification
  // Note: We no longer sign out automatically here. 
  // We want them authenticated so they can hit "Resend Email".
  // The frontend handles redirecting unverified users to `/verify-email`.

  return cred.user;
}

// ===== GOOGLE SIGN IN =====
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);

  // Check if user doc already exists
  const userRef = doc(db, 'users', result.user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await createUserDocument(result.user, {
      name: result.user.displayName || 'User',
      phone: '',
    });
  }

  return result.user;
}

// ===== LOGOUT =====
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ===== CREATE USER DOCUMENT =====
async function createUserDocument(
  firebaseUser: FirebaseUser,
  extra: { name: string; phone: string }
): Promise<void> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userData: Omit<ChocketUser, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: firebaseUser.uid,
    name: extra.name,
    email: firebaseUser.email || '',
    phone: extra.phone,
    role: 'buyer',
    status: 'active',
    isVerified: firebaseUser.emailVerified || false,
    profileImage: firebaseUser.photoURL || '',
    createdAt: serverTimestamp() as any,
  };
  await setDoc(userRef, userData);
}

// ===== GET USER ROLE =====
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data().role as UserRole;
}

// ===== GET USER DATA =====
export async function getUserData(uid: string): Promise<ChocketUser | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data() as ChocketUser;
}

// ===== ROLE CHECKS =====
export function canAccessAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'primeadmin';
}

export function canAccessSuperAdmin(role: UserRole): boolean {
  return role === 'primeadmin';
}

export function canAccessSeller(role: UserRole): boolean {
  return role === 'seller' || role === 'admin' || role === 'primeadmin';
}

// ===== GET DASHBOARD PATH =====
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'primeadmin':
      return '/superadmin/dashboard';
    case 'admin':
      return '/admin';
    case 'seller':
      return '/seller/dashboard';
    case 'buyer':
    default:
      return '/';
  }
}
