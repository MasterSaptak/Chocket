import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  increment,
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import type { ChocketUser } from '@/types';

export type RewardCategory = 'Discounts' | 'Special Chocolates' | 'Free Delivery' | 'Exclusive Treats';

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  image?: string;
  code?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'redeemed';
  reason: string;
  timestamp: any;
}

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 5000,
  gold: 15000,
  platinum: 50000
};

export const getTierBenefits = (tier: string) => {
  const benefits = {
    bronze: ['Standard cold-chain delivery', 'Birthday treat notification', 'Access to loyalty shop'],
    silver: ['2% point multiplier', 'Priority support access', 'Early access to seasonal drops'],
    gold: ['5% point multiplier', 'Free standard delivery on all orders', 'Annual gold-tier chocolate gift'],
    platinum: ['10% point multiplier', 'Dedicated concierge support', 'Unlimited free cold-chain delivery', 'Exclusive invite-only events']
  };
  return benefits[tier as keyof typeof benefits] || benefits.bronze;
};

export const calculateTier = (totalEarned: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (totalEarned >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalEarned >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalEarned >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

export const addChocoPoints = async (userId: string, amount: number, reason: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as ChocketUser;
    const newTotalPoints = (userData.total_points_earned || 0) + amount;
    const newTier = calculateTier(newTotalPoints);

    transaction.update(userRef, {
      choco_points: increment(amount),
      total_points_earned: increment(amount),
      tier: newTier
    });

    const logRef = collection(db, 'users', userId, 'points_history');
    transaction.set(doc(logRef), {
      amount,
      type: 'earned',
      reason,
      timestamp: serverTimestamp()
    });
  });
};

export const redeemChocoPoints = async (userId: string, amount: number, rewardId: string, rewardName: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as ChocketUser;
    if ((userData.choco_points || 0) < amount) throw new Error('Insufficient Choco Points');

    transaction.update(userRef, {
      choco_points: increment(-amount)
    });

    const logRef = collection(db, 'users', userId, 'points_history');
    transaction.set(doc(logRef), {
      amount: -amount,
      type: 'redeemed',
      reason: `Redeemed for: ${rewardName}`,
      rewardId,
      timestamp: serverTimestamp()
    });
  });
};

export const getPointsHistory = async (userId: string): Promise<PointsTransaction[]> => {
  const historyRef = collection(db, 'users', userId, 'points_history');
  const q = query(historyRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointsTransaction));
};

export const getRewardsStore = (): RewardItem[] => {
  return [
    { id: 'disc_500', name: '₹500 Instant Discount', description: 'Redeem for a ₹500 discount voucher on any order.', pointsCost: 5000, category: 'Discounts' },
    { id: 'free_del', name: 'Free Cold-Chain Delivery', description: 'One-time free delivery voucher for your next order.', pointsCost: 1500, category: 'Free Delivery' },
    { id: 'excl_dark', name: 'Artisan Dark Box (12pc)', description: 'Limited edition single-origin chocolate assortment.', pointsCost: 8000, category: 'Exclusive Treats', image: 'https://picsum.photos/seed/dark12/400/300' },
    { id: 'silver_truffle', name: 'Silver Tier Truffles', description: 'A box of 4 Belgian truffles crafted for Silver members.', pointsCost: 2500, category: 'Special Chocolates', image: 'https://picsum.photos/seed/truffles/400/300' },
  ];
};

export const processOrderRewards = async (userId: string, totalAmount: number): Promise<void> => {
  if (!userId || userId === 'guest') return;

  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    // 1 INR = 1 Point
    let pointsToEarn = Math.floor(totalAmount);
    let reason = `Order Purchase (₹${totalAmount})`;

    // First order bonus
    if (snapshot.size <= 1) { // Current order is already added, so size will be 1
      pointsToEarn += 100;
      reason += ' + First Order Bonus ✨';
    }

    await addChocoPoints(userId, pointsToEarn, reason);
  } catch (error) {
    console.error('Error processing rewards:', error);
  }
};
