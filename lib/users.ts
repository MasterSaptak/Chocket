import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChocketUser, UserRole, UserStatus } from '@/types';

const USERS_COLLECTION = 'users';

// ===== GET ALL USERS =====
export async function getAllUsers(): Promise<ChocketUser[]> {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id } as ChocketUser));
}

// ===== SUBSCRIBE TO USERS =====
export function subscribeToUsers(callback: (users: ChocketUser[]) => void): Unsubscribe {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id } as ChocketUser));
    callback(users);
  });
}

// ===== GET USER BY ID =====
export async function getUserById(uid: string): Promise<ChocketUser | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { ...userSnap.data(), uid: userSnap.id } as ChocketUser;
}

// ===== UPDATE USER ROLE =====
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { role: newRole });
}

// ===== UPDATE USER STATUS =====
export async function updateUserStatus(uid: string, status: UserStatus): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { status });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<ChocketUser, 'name' | 'phone' | 'profileImage' | 'dob' | 'lastUpdated'>>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userRef, data, { merge: true });
}

// ===== GET USERS BY ROLE =====
export async function getUsersByRole(role: UserRole): Promise<ChocketUser[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', role),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id } as ChocketUser));
}

// ===== BAN USER =====
export async function banUser(uid: string): Promise<void> {
  await updateUserStatus(uid, 'banned');
}

// ===== ACTIVATE USER =====
export async function activateUser(uid: string): Promise<void> {
  await updateUserStatus(uid, 'active');
}

// ===== PROMOTE USER =====
export async function promoteUser(uid: string, newRole: UserRole): Promise<void> {
  await updateUserRole(uid, newRole);
}

// ===== DELETE USER =====
export async function deleteUserDocument(uid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(userRef);
}
