import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { UserRole } from '@/types';

const AUDIT_COLLECTION = 'audit_logs';

export async function logAction(params: {
  action: string;
  performedBy: string;
  role: UserRole;
  targetId: string;
  reason?: string;
  bypass?: boolean;
}) {
  try {
    const auditRef = collection(db, AUDIT_COLLECTION);
    await addDoc(auditRef, {
      ...params,
      timestamp: new Date().toISOString(),
      bypass: params.bypass || false,
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}
