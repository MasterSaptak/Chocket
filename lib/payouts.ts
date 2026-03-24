import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import type { Payout } from '@/types';

const PAYOUTS_COLLECTION = 'payouts';

// ===== REQUEST PAYOUT (Seller) =====
export async function requestPayout(data: {
  sellerId: string;
  amount: number;
}): Promise<string> {
  const payoutsRef = collection(db, PAYOUTS_COLLECTION);
  const docRef = await addDoc(payoutsRef, {
    sellerId: data.sellerId,
    amount: data.amount,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  });
  return docRef.id;
}

// ===== GET ALL PAYOUTS (Super Admin) =====
export async function getAllPayouts(): Promise<Payout[]> {
  const q = query(
    collection(db, PAYOUTS_COLLECTION),
    orderBy('requestedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id } as Payout)
  );
}

// ===== SUBSCRIBE TO PAYOUTS =====
export function subscribeToPayouts(
  callback: (payouts: Payout[]) => void
): Unsubscribe {
  const q = query(
    collection(db, PAYOUTS_COLLECTION),
    orderBy('requestedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const payouts = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id } as Payout)
    );
    callback(payouts);
  });
}

// ===== GET SELLER PAYOUTS =====
export async function getSellerPayouts(sellerId: string): Promise<Payout[]> {
  const q = query(
    collection(db, PAYOUTS_COLLECTION),
    where('sellerId', '==', sellerId),
    orderBy('requestedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id } as Payout)
  );
}

// ===== APPROVE PAYOUT (Super Admin only) =====
export async function approvePayout(payoutId: string): Promise<void> {
  const payoutRef = doc(db, PAYOUTS_COLLECTION, payoutId);
  await updateDoc(payoutRef, {
    status: 'processing',
    processedAt: new Date().toISOString(),
  });
}

// ===== COMPLETE PAYOUT =====
export async function completePayout(payoutId: string): Promise<void> {
  const payoutRef = doc(db, PAYOUTS_COLLECTION, payoutId);
  await updateDoc(payoutRef, {
    status: 'completed',
    processedAt: new Date().toISOString(),
  });
}

// ===== FAIL PAYOUT =====
export async function failPayout(payoutId: string): Promise<void> {
  const payoutRef = doc(db, PAYOUTS_COLLECTION, payoutId);
  await updateDoc(payoutRef, {
    status: 'failed',
  });
}
