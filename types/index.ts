// ===== ROLE & STATUS TYPES =====
export type UserRole = 'buyer' | 'seller' | 'manager' | 'primeadmin';
export type UserStatus = 'active' | 'banned';
export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';
export type SellingPlatform = 'Instagram' | 'Facebook' | 'Offline' | 'Website' | 'Other';
export type ProductStatus = 'pending_review' | 'approved' | 'rejected' | 'live';

// ===== USER =====
export interface ChocketUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  isVerified: boolean;
  profileImage: string;
  dob?: string;
  pending_balance?: number;
  available_balance?: number;
}

// ===== SELLER APPLICATION =====
export interface SellerApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  sellingPlatform: SellingPlatform;
  experience: string;
  identityProof: string; // file URL
  status: SellerApplicationStatus;
  appliedAt: string;
  reviewedBy?: string; // manager/super_admin uid
  reviewedAt?: string;
  rejectionReason?: string;
}

// ===== PRODUCT =====
export interface Product {
  id: string;
  sellerId: string;
  name: string;
  brand: string;
  description: string;
  prices: {
    [currency: string]: number;
  };
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  status: 'live';
  approvedBy: string;
  bypass?: boolean;
  updatedAt: string;
  createdAt: string;
}

// ===== PRODUCT VERSION (Moderation System) =====
export interface ProductVersion {
  id: string;
  productId: string;
  data: Partial<Product>;
  status: ProductStatus;
  createdBy: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== AUDIT LOG =====
export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  targetId: string;
  timestamp: string;
  reason?: string;
  bypass: boolean;
}

// ===== CATEGORY =====
export interface Category {
  id: string;
  name: string;
  image: string;
}

// ===== ORDERS =====
export interface Order {
  id: string;
  userId: string;
  sellerId: string;
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
  createdAt: string;
  deliveryDate?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  currency: string;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface GiftDetails {
  occasion: 'Birthday' | 'Anniversary' | 'Valentine' | 'Custom';
  message: string;
  wrapOption: boolean;
  recipientEmail?: string;
  recipientPhone?: string;
}

// ===== PAYOUTS =====
export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
}

// ===== REVIEWS =====
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// ===== MISCELLANEOUS =====
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
  timestamp: string;
}
