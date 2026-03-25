import { Timestamp } from 'firebase/firestore';

export type UserRole = 'buyer' | 'seller' | 'manager' | 'primeadmin';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    promotions: boolean;
  };
  language: string;
  currency: string;
}

export interface UserRewards {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  history: Array<{
    id: string;
    points: number;
    description: string;
    date: string;
  }>;
}

export interface UserCommandCenterData {
  profile: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    profileImage?: string;
    completeness: number;
    lastUpdated: string;
  };
  addresses: Address[];
  preferences: UserPreferences;
  rewards: UserRewards;
  wishlistCount: number;
  ordersCount: number;
}
