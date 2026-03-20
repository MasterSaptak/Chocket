export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  wishlist: string[]; // array of product IDs
  createdAt: Date | string | number;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string; // Used for dynamic pricing and cross-border delivery
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  prices: {
    [currency: string]: number; // e.g., { USD: 25, INR: 1500, EUR: 23 }
  };
  images: string[];
  category: string;
  stock: number;
  rating: number;
  countryAvailability: string[]; // e.g., ['US', 'IN', 'UK', 'CA']
  createdAt: Date | string | number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  country: string;
  paymentStatus: 'Pending' | 'Success' | 'Failed';
  paymentProvider: 'Razorpay' | 'Stripe' | 'PayPal' | 'Wise';
  transactionId?: string;
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingId?: string;
  isGift: boolean;
  giftDetails?: GiftDetails;
  createdAt: Date | string | number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  currency: string;
}

export interface GiftDetails {
  occasion: 'Birthday' | 'Anniversary' | 'Valentine' | 'Custom';
  message: string;
  wrapOption: boolean;
  recipientEmail?: string;
  recipientPhone?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date | string | number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  readStatus: boolean;
  timestamp: Date | string | number;
}
