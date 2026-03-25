import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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

// Re-export from rbac for backward compatibility
export {
  canAccessSuperAdminDashboard as canAccessSuperAdmin,
  canAccessManagerDashboard as canAccessAdmin,
  canAccessSellerDashboard as canAccessSeller,
  getDashboardPath,
} from './rbac';

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

  // Send Firebase Email Verification natively
  try {
    await sendEmailVerification(cred.user);
  } catch (e: any) {
    console.error("Failed to send verification email:", e);
    // Don't sign out or throw - let them go to the verification page to try again later
  }

  return cred.user;
}

// ===== LOGIN WITH EMAIL =====
export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ===== GOOGLE SIGN IN =====
export async function signInWithGoogle(forceRedirect: boolean = false): Promise<{ user: FirebaseUser, role: UserRole } | void> {
  try {
    // If it's mobile or the user chose a hard-redirect (for troubleshooting)
    if (forceRedirect) {
      console.log('--- 🚀 STARTING GOOGLE REDIRECT AUTH ---');
      return signInWithRedirect(auth, googleProvider);
    }
    
    console.log('--- 🔲 STARTING GOOGLE POPUP AUTH ---');
    const result = await signInWithPopup(auth, googleProvider);
    
    // 🔥 OPTIMIZATION: Return immediately after Google Auth.
    return { user: result.user, role: 'buyer' };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('ℹ️ Google Sign-in popup closed or cancelled.');
      return;
    }
    
    // Auto-fallback to redirect if popup is blocked or fails in a way that suggests cross-site issues
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      console.warn('⚠️ Popup blocked or unsupported, falling back to redirect...');
      return signInWithRedirect(auth, googleProvider);
    }

    console.error('Sign-in with Google failed:', error);
    throw error;
  }
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
    choco_points: 0,
    total_points_earned: 0,
    tier: 'bronze',
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
