import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { createProductVersion, createApprovedVersion, approveVersionWithProductData } from './productVersions';
import { logAction } from './audit';
import { normalizeProduct, enhancedToLegacy, intakeToEnhanced } from './product-adapter';
import { initializeDefaultRates } from './currency';
import type { UserRole, Product, LegacyProduct, ProductIntakeDraft } from '@/types';

const COLLECTION_NAME = 'products';

// Initialize currency system
initializeDefaultRates().catch(console.error);

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => stripUndefined(item)) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, stripUndefined(entryValue)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}

function prepareProductPayload(product: Omit<Product, 'id'> | Partial<Product>): Omit<Product, 'id'> | Partial<Product> {
  const productId = 'id' in product && typeof product.id === 'string' ? product.id : 'draft-product';
  const normalized = normalizeProduct({
    id: productId,
    sellerId: product.sellerId || '',
    name: product.name || '',
    brand: product.brand || 'Chocket',
    description: product.description || '',
    pricing: product.pricing || {
      buying: { amount: 0, currency: 'INR' },
      base: { amount: 0, currency: 'INR' },
      selling: { amount: 0, currency: 'INR' },
    },
    wholesale: product.wholesale || { amount: 0, currency: 'INR' },
    markets: product.markets || [],
    defaultMarketId: product.defaultMarketId || '',
    images: product.images || [],
    category: product.category || 'Premium',
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    status: 'live',
    approvedBy: product.approvedBy || '',
    bypass: product.bypass,
    supplyChain: product.supplyChain || {
      originCountry: 'India',
      procurementCountry: 'India',
    },
    updatedAt: product.updatedAt || new Date().toISOString(),
    createdAt: product.createdAt || new Date().toISOString(),
  });

  const { id, ...payload } = normalized;
  return stripUndefined(payload);
}

/**
 * Add product with new multi-currency schema — behavior depends on role:
 * - primeadmin/manager: directly published as live
 * - seller: creates a product_versions entry as pending_review
 */
export async function addEnhancedProductByRole(
  product: Omit<Product, 'id'>,
  userId: string,
  role: UserRole
): Promise<string> {
  const payload = prepareProductPayload(product) as Omit<Product, 'id'>;

  if (role === 'primeadmin' || role === 'manager') {
    // Direct publish
    const productsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(productsRef, {
      ...payload,
      sellerId: payload.sellerId || userId,
      status: 'live',
      approvedBy: role === 'primeadmin' ? 'primeadmin' : userId,
      bypass: role === 'primeadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Audit log
    await logAction({
      action: 'create_enhanced_product',
      performedBy: userId,
      role,
      targetId: docRef.id,
      bypass: role === 'primeadmin',
    });

    // Also create a version record for consistency
    await createApprovedVersion({
      productId: docRef.id,
      productData: payload,
      createdBy: userId,
    });

    return docRef.id;
  } else {
    // Seller flow: create version for moderation
    const tempProductId = `pending_${Date.now()}_${userId}`;
    const versionId = await createProductVersion({
      productId: tempProductId,
      productData: { ...payload, sellerId: userId },
      createdBy: userId,
    });

    await logAction({
      action: 'submit_enhanced_product_for_review',
      performedBy: userId,
      role,
      targetId: versionId,
      bypass: false,
    });

    return versionId;
  }
}

export async function createSimpleProductDraft(
  intake: ProductIntakeDraft,
  userId: string,
  role: UserRole
): Promise<string> {
  const versionId = await createProductVersion({
    productId: `draft_${Date.now()}_${userId}`,
    productData: stripUndefined({
      ...intake,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    createdBy: userId,
  });

  await logAction({
    action: 'create_simple_product_draft',
    performedBy: userId,
    role,
    targetId: versionId,
    bypass: role === 'primeadmin',
  });

  return versionId;
}

export async function publishDraftVersion(
  versionId: string,
  product: Omit<Product, 'id'>,
  userId: string,
  role: UserRole
): Promise<string> {
  const payload = prepareProductPayload(product) as Omit<Product, 'id'>;
  const productsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(productsRef, {
    ...payload,
    sellerId: payload.sellerId || userId,
    status: 'live',
    approvedBy: role === 'primeadmin' ? 'primeadmin' : userId,
    bypass: role === 'primeadmin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await approveVersionWithProductData(versionId, userId, docRef.id, payload);

  await logAction({
    action: 'publish_product_draft',
    performedBy: userId,
    role,
    targetId: docRef.id,
    bypass: role === 'primeadmin',
  });

  return docRef.id;
}

export function draftDataToProduct(draftData: ProductIntakeDraft | Partial<Product>): Product {
  if ('originMrp' in draftData) {
    return intakeToEnhanced(draftData);
  }

  return normalizeProduct(draftData);
}

/**
 * Get all products with automatic legacy conversion
 */
export async function getAllEnhancedProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsRef);
    
    return snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as any;
      return normalizeProduct(data);
    });
  } catch (error) {
    console.error('Error fetching enhanced products:', error);
    return [];
  }
}

/**
 * Get product by ID with automatic legacy conversion
 */
export async function getEnhancedProductById(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(productRef);
    
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as any;
      return normalizeProduct(data);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching enhanced product by id:', error);
    return null;
  }
}

/**
 * Subscribe to products with automatic legacy conversion
 */
export function subscribeToEnhancedProducts(callback: (products: Product[]) => void) {
  const productsRef = collection(db, COLLECTION_NAME);
  return onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as any;
      return normalizeProduct(data);
    });
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
}

/**
 * Update product with enhanced schema
 */
export async function updateEnhancedProduct(id: string, updates: Partial<Product>): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, id);
  const payload = prepareProductPayload({ ...updates, id });
  await updateDoc(productRef, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete enhanced product
 */
export async function deleteEnhancedProduct(id: string): Promise<void> {
  const productRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(productRef);
}

/**
 * Get seller products with enhanced schema
 */
export async function getEnhancedSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as any;
      return normalizeProduct(data);
    });
  } catch (error) {
    console.error('Error fetching enhanced seller products:', error);
    return [];
  }
}

/**
 * Convert legacy products in database to enhanced format (migration utility)
 */
export async function migrateLegacyProducts(): Promise<{ converted: number; errors: number }> {
  const results = { converted: 0, errors: 0 };
  
  try {
    const products = await getAllEnhancedProducts();
    
    for (const product of products) {
      try {
        // Check if this was originally a legacy product by looking for old fields
        const productRef = doc(db, COLLECTION_NAME, product.id);
        const snap = await getDoc(productRef);
        
        if (snap.exists()) {
          const rawData = snap.data();
          
          // If it has old 'price' field but no 'pricing' object, convert it
          if (typeof rawData.price === 'number' && !rawData.pricing) {
            const enhancedData = normalizeProduct({ id: product.id, ...rawData });
            await setDoc(productRef, enhancedData);
            results.converted++;
          }
        }
      } catch (error) {
        console.error(`Error migrating product ${product.id}:`, error);
        results.errors++;
      }
    }
  } catch (error) {
    console.error('Error during migration:', error);
    results.errors++;
  }
  
  return results;
}

/**
 * Backward compatibility wrapper for legacy systems
 */
export async function getLegacyProducts(): Promise<LegacyProduct[]> {
  const enhancedProducts = await getAllEnhancedProducts();
  return enhancedProducts.map(enhancedToLegacy);
}