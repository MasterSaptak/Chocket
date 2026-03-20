import { db, OperationType, handleFirestoreError } from '@/firebase';
import { collection, getDocs, doc, setDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Product } from '@/components/ProductCard';

export type { Product };

const COLLECTION_NAME = 'products';

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
    const q = query(productsRef, limit(4)); // In a real app, you might filter by isFeatured
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Return mock data if DB is empty and seeding hasn't finished
      return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Fallback to mock data on error
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

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return initialProducts.map((p, i) => ({ ...p, id: String(i + 1) }));
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsRef);
    
    const doc = snapshot.docs.find(d => d.id === id);
    if (doc) {
      return { id: doc.id, ...doc.data() } as Product;
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
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
}
