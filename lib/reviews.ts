import { db } from '@/firebase';
import { collection, getDocs, doc, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const COLLECTION_NAME = 'reviews';

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, COLLECTION_NAME);
    const q = query(
      reviewsRef, 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Review));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, COLLECTION_NAME);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Review));
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}

export async function updateReviewStatus(reviewId: string, status: Review['status']): Promise<void> {
  const reviewRef = doc(db, COLLECTION_NAME, reviewId);
  await updateDoc(reviewRef, { status });
}

export async function deleteReview(reviewId: string): Promise<void> {
  const reviewRef = doc(db, COLLECTION_NAME, reviewId);
  await deleteDoc(reviewRef);
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const reviewsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(reviewsRef, {
    ...review,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function seedReviewsIfEmpty() {
  try {
    const reviewsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(reviewsRef);
    
    if (snapshot.empty) {
      console.log('Seeding initial reviews...');
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      if (!productsSnapshot.empty) {
        const firstProduct = productsSnapshot.docs[0];
        const mockReviews: Omit<Review, 'id'>[] = [
          {
            productId: firstProduct.id,
            userId: 'user1',
            userName: 'John Doe',
            rating: 5,
            comment: 'Absolutely delicious! The best chocolate I have ever had.',
            status: 'approved',
            createdAt: new Date().toISOString(),
          },
          {
            productId: firstProduct.id,
            userId: 'user2',
            userName: 'Jane Smith',
            rating: 4,
            comment: 'Very good quality, though a bit expensive.',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            productId: firstProduct.id,
            userId: 'user3',
            userName: 'Mike Ross',
            rating: 2,
            comment: 'Not what I expected. The packaging was damaged.',
            status: 'pending',
            createdAt: new Date().toISOString(),
          }
        ];
        
        for (const review of mockReviews) {
          await addDoc(reviewsRef, review);
        }
        console.log('Seeding reviews complete.');
      }
    }
  } catch (error) {
    console.error('Error seeding reviews:', error);
  }
}
