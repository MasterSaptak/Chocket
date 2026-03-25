import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  serverTimestamp,
  type DocumentReference,
  type CollectionReference,
  addDoc
} from 'firebase/firestore';
import type { Address, UserPreferences } from '@/types/profile';

const USERS_COLLECTION = 'users';
const ADDRESSES_SUBCOLLECTION = 'addresses';

// Addresses management
export const getAddresses = async (userId: string): Promise<Address[]> => {
  const addressesRef = collection(db, USERS_COLLECTION, userId, ADDRESSES_SUBCOLLECTION);
  const q = query(addressesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
};

export const addAddress = async (userId: string, address: Omit<Address, 'id' | 'createdAt'>): Promise<string> => {
  const addressesRef = collection(db, USERS_COLLECTION, userId, ADDRESSES_SUBCOLLECTION);
  
  // If this is set as default, we need to unset all others
  if (address.isDefault) {
    await unsetAllDefaultAddresses(userId);
  }

  const docRef = await addDoc(addressesRef, {
    ...address,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const updateAddress = async (userId: string, addressId: string, updates: Partial<Address>): Promise<void> => {
  const addressRef = doc(db, USERS_COLLECTION, userId, ADDRESSES_SUBCOLLECTION, addressId);
  
  if (updates.isDefault) {
    await unsetAllDefaultAddresses(userId);
  }

  await updateDoc(addressRef, updates);
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  const addressRef = doc(db, USERS_COLLECTION, userId, ADDRESSES_SUBCOLLECTION, addressId);
  await deleteDoc(addressRef);
};

const unsetAllDefaultAddresses = async (userId: string) => {
  const addresses = await getAddresses(userId);
  const promises = addresses
    .filter(a => a.isDefault)
    .map(a => updateDoc(doc(db, USERS_COLLECTION, userId, ADDRESSES_SUBCOLLECTION, a.id), { isDefault: false }));
  await Promise.all(promises);
};

// Preferences management
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const prefRef = doc(db, USERS_COLLECTION, userId, 'settings', 'preferences');
  const snap = await getDoc(prefRef);
  return snap.exists() ? (snap.data() as UserPreferences) : null;
};

export const saveUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
  const prefRef = doc(db, USERS_COLLECTION, userId, 'settings', 'preferences');
  await setDoc(prefRef, preferences, { merge: true });
};

// Profile completeness calculation
export const calculateProfileCompleteness = (userData: any): number => {
  const fields = ['name', 'phone', 'dob', 'profileImage'];
  const filledFields = fields.filter(f => !!userData[f]);
  return Math.round((filledFields.length / fields.length) * 100);
};
