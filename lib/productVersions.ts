import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import type { ProductVersion, ProductStatus } from '@/types';

const VERSIONS_COLLECTION = 'product_versions';

// ===== CREATE A NEW VERSION (Seller submits product/edit) =====
export async function createProductVersion(data: {
  productId: string;
  productData: Record<string, any>;
  createdBy: string;
}): Promise<string> {
  const versionsRef = collection(db, VERSIONS_COLLECTION);
  const docRef = await addDoc(versionsRef, {
    productId: data.productId,
    data: data.productData,
    status: 'pending_review' as ProductStatus,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

// ===== SUPER ADMIN BYPASS: create version already approved =====
export async function createApprovedVersion(data: {
  productId: string;
  productData: Record<string, any>;
  createdBy: string;
}): Promise<string> {
  const versionsRef = collection(db, VERSIONS_COLLECTION);
  const docRef = await addDoc(versionsRef, {
    productId: data.productId,
    data: data.productData,
    status: 'approved' as ProductStatus,
    createdBy: data.createdBy,
    reviewedBy: 'primeadmin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

// ===== GET ALL PENDING VERSIONS (for moderation queue) =====
export async function getPendingVersions(): Promise<ProductVersion[]> {
  const q = query(
    collection(db, VERSIONS_COLLECTION),
    where('status', '==', 'pending_review'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id } as ProductVersion)
  );
}

// ===== SUBSCRIBE TO PENDING VERSIONS =====
export function subscribeToPendingVersions(
  callback: (versions: ProductVersion[]) => void
): Unsubscribe {
  const q = query(
    collection(db, VERSIONS_COLLECTION),
    where('status', '==', 'pending_review'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const versions = snapshot.docs.map(
      (d) => ({ ...d.data(), id: d.id } as ProductVersion)
    );
    callback(versions);
  });
}

// ===== GET VERSIONS BY PRODUCT ID =====
export async function getVersionsByProductId(
  productId: string
): Promise<ProductVersion[]> {
  const q = query(
    collection(db, VERSIONS_COLLECTION),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id } as ProductVersion)
  );
}

// ===== GET VERSIONS BY SELLER =====
export async function getVersionsBySeller(
  sellerId: string
): Promise<ProductVersion[]> {
  const q = query(
    collection(db, VERSIONS_COLLECTION),
    where('createdBy', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id } as ProductVersion)
  );
}

// ===== APPROVE VERSION =====
export async function approveVersion(
  versionId: string,
  reviewedBy: string
): Promise<Record<string, any>> {
  const versionRef = doc(db, VERSIONS_COLLECTION, versionId);
  const versionSnap = await getDoc(versionRef);
  if (!versionSnap.exists()) throw new Error('Version not found');

  const versionData = versionSnap.data();

  // Update version status
  await updateDoc(versionRef, {
    status: 'approved' as ProductStatus,
    reviewedBy,
    updatedAt: new Date().toISOString(),
  });

  // Return the product data so caller can push it live
  return {
    productId: versionData.productId,
    productData: versionData.data,
  };
}

// ===== REJECT VERSION =====
export async function rejectVersion(
  versionId: string,
  reviewedBy: string,
  rejectionReason: string
): Promise<void> {
  const versionRef = doc(db, VERSIONS_COLLECTION, versionId);
  await updateDoc(versionRef, {
    status: 'rejected' as ProductStatus,
    reviewedBy,
    rejectionReason,
    updatedAt: new Date().toISOString(),
  });
}

// ===== GET VERSION BY ID =====
export async function getVersionById(
  versionId: string
): Promise<ProductVersion | null> {
  const versionRef = doc(db, VERSIONS_COLLECTION, versionId);
  const snap = await getDoc(versionRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as ProductVersion;
}
