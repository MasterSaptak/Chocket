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
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastUpdated?: string;
  choco_points: number;
  total_points_earned: number;
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

// ===== CURRENCY & PRICING =====
export type Currency = 'INR' | 'USD' | 'EUR' | 'BDT';

export interface CurrencyPrice {
  amount: number;
  currency: Currency;
}

export interface ProductPricing {
  buying: CurrencyPrice;
  base: CurrencyPrice;
  selling: CurrencyPrice;
}

export type DiscountType = 'percentage' | 'flat';

export interface ProductDiscount {
  type: DiscountType;
  value: number;
  isActive: boolean;
  validUntil?: string;
}

export interface OriginMrp {
  amount: number;
  currency: Currency;
}

export interface ProductMarketPricing {
  id: string;
  marketName: string;
  marketCode: string;
  currency: Currency;
  listPrice: number;
  sellingPrice: number;
  customerPrice: number;
  discount?: ProductDiscount;
}

export interface SupplyChain {
  originCountry: string;
  procurementCountry: string;
  supplier?: string;
  processingLocation?: string;
  certifications?: string[];
}

// ===== PRODUCT =====
export interface Product {
  id: string;
  sellerId: string;
  name: string;
  brand: string;
  description: string;
  pricing: ProductPricing;
  wholesale: CurrencyPrice;
  markets: ProductMarketPricing[];
  defaultMarketId: string;
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
  supplyChain: SupplyChain;
  updatedAt: string;
  createdAt: string;
}

export interface ProductIntakeDraft {
  name: string;
  category: string;
  originCountry: string;
  originMrp: OriginMrp;
  mainImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== LEGACY PRODUCT (for backward compatibility) =====
export interface LegacyProduct {
  id: string;
  sellerId?: string;
  name: string;
  description?: string;
  price: number;
  buyingPrice?: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  status?: string;
  approvedBy?: string;
  bypass?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===== EXCHANGE RATES =====
export interface ExchangeRate {
  id: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  rate: number;
  lastUpdated: string;
  source: 'manual' | 'api';
}

export interface CurrencySettings {
  defaultCurrency: Currency;
  autoConversion: boolean;
  supportedCurrencies: Currency[];
  lastRateUpdate: string;
}

// ===== PRODUCT VERSION (Moderation System) =====
export interface ProductVersion {
  id: string;
  productId: string;
  data: Partial<Product> | ProductIntakeDraft;
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
