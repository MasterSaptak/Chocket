import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, onSnapshot, arrayUnion } from 'firebase/firestore';

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
}

export interface Order {
  id: string;
  userId: string;
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
}

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
