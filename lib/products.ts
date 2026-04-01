import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { LegacyProduct as Product } from '@/types';
import { createProductVersion, createApprovedVersion } from './productVersions';
import { logAction } from './audit';
import type { UserRole } from '@/types';
import { enhancedToLegacy, isLegacyProduct, normalizeProduct } from './product-adapter';

export type { Product };

const COLLECTION_NAME = 'products';

/**
 * Add product — behavior depends on role:
 * - super_admin: directly published as live (bypass moderation)
 * - manager: directly published as live
 * - seller: creates a product_versions entry as pending_review
 */
export async function addProductByRole(
  product: Omit<Product, 'id'>,
  userId: string,
  role: UserRole
): Promise<string> {
  if (role === 'primeadmin' || role === 'manager') {
    // Direct publish
    const productsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(productsRef, {
      ...product,
      sellerId: product.sellerId || userId,
      status: 'live',
      approvedBy: role === 'primeadmin' ? 'primeadmin' : userId,
      bypass: role === 'primeadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Audit log
    await logAction({
      action: 'create_product',
      performedBy: userId,
      role,
      targetId: docRef.id,
      bypass: role === 'primeadmin',
    });

    // Also create a version record for consistency
    await createApprovedVersion({
      productId: docRef.id,
      productData: product,
      createdBy: userId,
    });

    return docRef.id;
  } else {
    // Seller flow: create version for moderation
    // Use a placeholder productId (will be assigned on approval if new)
    const tempProductId = `pending_${Date.now()}_${userId}`;
    const versionId = await createProductVersion({
      productId: tempProductId,
      productData: { ...product, sellerId: userId },
      createdBy: userId,
    });

    await logAction({
      action: 'submit_product_for_review',
      performedBy: userId,
      role,
      targetId: versionId,
      bypass: false,
    });

    return versionId;
  }
}

/**
 * Edit product — depends on role:
 * - super_admin: directly updates live product
 * - manager: directly updates live product
 * - seller: creates a new version for review (live product untouched)
 */
export async function editProductByRole(
  productId: string,
  updates: Partial<Product>,
  userId: string,
  role: UserRole
): Promise<void> {
  if (role === 'primeadmin' || role === 'manager') {
    const productRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(productRef, {
      ...updates,
      approvedBy: role === 'primeadmin' ? 'primeadmin' : userId,
      bypass: role === 'primeadmin',
      updatedAt: new Date().toISOString(),
    });

    await logAction({
      action: 'edit_product',
      performedBy: userId,
      role,
      targetId: productId,
      bypass: role === 'primeadmin',
    });

    // Create version record for audit trail
    await createApprovedVersion({
      productId,
      productData: updates,
      createdBy: userId,
    });
  } else {
    // Seller: create version, don't touch live product
    await createProductVersion({
      productId,
      productData: updates,
      createdBy: userId,
    });

    await logAction({
      action: 'submit_product_edit_for_review',
      performedBy: userId,
      role,
      targetId: productId,
      bypass: false,
    });
  }
}

/**
 * Publish a product version (moderation approval).
 * Called by manager or super_admin.
 */
export async function publishProductFromVersion(
  productId: string,
  productData: Record<string, any>,
  approvedBy: string,
  role: UserRole
): Promise<string> {
  const isNewProduct = productId.startsWith('pending_');
  let finalProductId = productId;

  if (isNewProduct) {
    // Create a new live product
    const productsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(productsRef, {
      ...productData,
      status: 'live',
      approvedBy,
      bypass: role === 'primeadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    finalProductId = docRef.id;
  } else {
    // Update existing live product
    const productRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(productRef, {
      ...productData,
      status: 'live',
      approvedBy,
      bypass: role === 'primeadmin',
      updatedAt: new Date().toISOString(),
    });
  }

  await logAction({
    action: 'approve_product',
    performedBy: approvedBy,
    role,
    targetId: finalProductId,
    bypass: role === 'primeadmin',
  });

  return finalProductId;
}

// ===== LEGACY / DIRECT FUNCTIONS (for backward compat) =====

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(productsRef, {
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(productRef);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  const promises = ids.map(id => deleteProduct(id));
  await Promise.all(promises);
}

// ===== GET PRODUCTS =====

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return [];
  }
}

// Mock data for seeding
const initialProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Swiss Dark Truffle Box',
    description: 'A luxurious collection of dark chocolate truffles made with the finest Swiss cocoa.',
    price: 1299,
    originalPrice: 1599,
    buyingPrice: 800,
    images: ['https://picsum.photos/seed/swiss-truffle/600/600'],
    category: 'Imported',
    rating: 4.8,
    reviews: 124,
    isBestSeller: true,
    stock: 50,
  },
  {
    name: 'Belgian Hazelnut Praline',
    description: 'Smooth Belgian milk chocolate filled with roasted hazelnut praline.',
    price: 899,
    buyingPrice: 500,
    images: ['https://picsum.photos/seed/belgian-praline/600/600'],
    category: 'Premium',
    rating: 4.9,
    reviews: 89,
    isNew: true,
    stock: 50,
  },
  {
    name: 'Assorted Macaron Box',
    description: 'A colorful set of 12 handcrafted French macarons in various flavors.',
    price: 1499,
    originalPrice: 1899,
    buyingPrice: 900,
    images: ['https://picsum.photos/seed/macarons/600/600'],
    category: 'Desserts',
    rating: 4.7,
    reviews: 210,
    stock: 50,
  },
  {
    name: 'Classic Chocolate Chip Cookies',
    description: 'Buttery, chewy cookies loaded with premium dark chocolate chips.',
    price: 499,
    buyingPrice: 250,
    images: ['https://picsum.photos/seed/choc-chip/600/600'],
    category: 'Cookies',
    rating: 4.6,
    reviews: 342,
    stock: 50,
  },
];

export async function seedProductsIfEmpty() {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(query(productsRef, limit(1)));
    
    if (snapshot.empty) {
      console.log('Seeding initial products...');
      for (const product of initialProducts) {
        const newDocRef = doc(productsRef);
        await setDoc(newDocRef, {
          ...product,
          sellerId: 'system',
          status: 'live',
          approvedBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log('Seeding complete.');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, limit(4));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
    }

    return snapshot.docs.map(doc => enhancedToLegacy(normalizeProduct({
      id: doc.id,
      ...doc.data(),
    })));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
    }

    return snapshot.docs.map(doc => enhancedToLegacy(normalizeProduct({
      id: doc.id,
      ...doc.data(),
    })));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(productRef);
    if (snap.exists()) {
      return enhancedToLegacy(normalizeProduct({ id: snap.id, ...snap.data() }));
    }
    
    // Fallback to mock data
    const mockProduct = initialProducts[parseInt(id) - 1];
    if (mockProduct) {
      return { id, ...mockProduct };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void) {
  const productsRef = collection(db, COLLECTION_NAME);
  return onSnapshot(productsRef, (snapshot) => {
    if (snapshot.empty) {
      callback(initialProducts.map((p, i) => ({ ...p, id: String(i + 1) } as Product)));
      return;
    }
    
    const products = snapshot.docs.map(doc => enhancedToLegacy(normalizeProduct({
      id: doc.id,
      ...doc.data(),
    })));
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
}
