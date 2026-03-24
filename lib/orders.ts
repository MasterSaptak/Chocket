import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, where, onSnapshot, arrayUnion } from 'firebase/firestore';
import { logAction } from './audit';
import type { UserRole } from '@/types';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

export interface OrderStatusHistory {
  status: Order['status'];
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  userId: string;
  sellerId?: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  deliveryDate?: string;
}

// ===== GET ALL ORDERS (manager/super_admin) =====
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// ===== GET SELLER ORDERS (seller can see only own) =====
export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return [];
  }
}

// ===== GET BUYER ORDERS =====
export async function getBuyerOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    return [];
  }
}

/**
 * Update order status with role-based enforcement:
 * - seller: can only update to 'processing', 'shipped', 'delivered' (NOT cancel/refund)
 * - manager: can do all status updates including cancel
 * - super_admin: full control
 */
export async function updateOrderStatusByRole(
  orderId: string,
  status: Order['status'],
  userId: string,
  role: UserRole,
  note?: string
): Promise<void> {
  // Validate seller permissions
  if (role === 'seller') {
    const allowedSellerStatuses: Order['status'][] = ['processing', 'shipped', 'delivered'];
    if (!allowedSellerStatuses.includes(status)) {
      throw new Error('Sellers cannot cancel or refund orders. Contact a manager.');
    }
  }

  try {
    const orderRef = doc(db, 'orders', orderId);
    const historyEntry: OrderStatusHistory = {
      status,
      timestamp: new Date().toISOString(),
      note,
      updatedBy: userId,
    };
    
    await updateDoc(orderRef, { 
      status,
      statusHistory: arrayUnion(historyEntry)
    });

    await logAction({
      action: `update_order_status_${status}`,
      performedBy: userId,
      role,
      targetId: orderId,
      reason: note,
      bypass: role === 'primeadmin',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Legacy function
export async function updateOrderStatus(orderId: string, status: Order['status'], note?: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const historyEntry: OrderStatusHistory = {
      status,
      timestamp: new Date().toISOString(),
      note
    };
    
    await updateDoc(orderRef, { 
      status,
      statusHistory: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function updateOrdersStatus(orderIds: string[], status: Order['status'], note?: string): Promise<void> {
  const promises = orderIds.map(id => updateOrderStatus(id, status, note));
  await Promise.all(promises);
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
  });
}

// ===== SUBSCRIBE TO SELLER'S ORDERS =====
export function subscribeToSellerOrders(sellerId: string, callback: (orders: Order[]) => void) {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
  });
}
