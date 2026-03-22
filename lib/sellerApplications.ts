import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { updateUserRole } from './users';
import type { SellerApplication, SellerApplicationStatus, SellingPlatform } from '@/types';

const COLLECTION = 'sellerApplications';

// ===== SUBMIT APPLICATION =====
export interface SubmitApplicationPayload {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  sellingPlatform: SellingPlatform;
  experience: string;
  identityProof: string;
}

export async function submitSellerApplication(
  data: SubmitApplicationPayload
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'pending' as SellerApplicationStatus,
    appliedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ===== GET ALL APPLICATIONS =====
export async function getAllApplications(): Promise<SellerApplication[]> {
  const q = query(collection(db, COLLECTION), orderBy('appliedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as SellerApplication)
  );
}

// ===== SUBSCRIBE TO APPLICATIONS =====
export function subscribeToApplications(
  callback: (apps: SellerApplication[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('appliedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as SellerApplication)
    );
    callback(apps);
  });
}

// ===== GET APPLICATIONS BY STATUS =====
export async function getApplicationsByStatus(
  status: SellerApplicationStatus
): Promise<SellerApplication[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status),
    orderBy('appliedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as SellerApplication)
  );
}

// ===== GET USER APPLICATION =====
export async function getUserApplication(
  userId: string
): Promise<SellerApplication | null> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('appliedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ...doc.data(), id: doc.id } as SellerApplication;
}

// ===== APPROVE APPLICATION =====
export async function approveApplication(
  applicationId: string,
  userId: string,
  adminUid: string
): Promise<void> {
  // Update application status
  const appRef = doc(db, COLLECTION, applicationId);
  await updateDoc(appRef, {
    status: 'approved' as SellerApplicationStatus,
    reviewedBy: adminUid,
    reviewedAt: new Date().toISOString(),
  });

  // Promote user to seller
  await updateUserRole(userId, 'seller');
}

// ===== REJECT APPLICATION =====
export async function rejectApplication(
  applicationId: string,
  adminUid: string,
  reason?: string
): Promise<void> {
  const appRef = doc(db, COLLECTION, applicationId);
  await updateDoc(appRef, {
    status: 'rejected' as SellerApplicationStatus,
    reviewedBy: adminUid,
    reviewedAt: new Date().toISOString(),
    rejectionReason: reason || '',
  });
}
