import { getAdminDb } from './firebase-admin';
import { Product } from '@/components/ProductCard';

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection('products').doc(id).get();
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by id with admin sdk:', error);
    return null;
  }
}
