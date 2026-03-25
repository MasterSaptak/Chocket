'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Star, Crown, Gift, 
  History, ArrowRight, CheckCircle2, 
  Loader2, ShoppingBag, Sparkles, TrendingUp,
  Tag, Truck, Zap
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { 
  getRewardsStore, 
  getPointsHistory, 
  getTierBenefits, 
  redeemChocoPoints, 
  TIER_THRESHOLDS,
  RewardItem,
  PointsTransaction
} from '@/lib/rewards-service';
import { toast } from 'sonner';

export default function Rewards() {
  const { user, userData } = useAuth();
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      const data = await getPointsHistory(user!.uid);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load points history:', err);
      toast.error('Unable to fetch points history. Check your connection or sign in again.');
    } finally {
      setLoading(false);
    }
  };

  const currentTier = userData?.tier || 'bronze';
  const currentPoints = userData?.choco_points || 0;
  const totalEarned = userData?.total_points_earned || 0;
  
  const getNextTierInfo = () => {
    if (currentTier === 'platinum') return { name: 'Maxed Out', threshold: 0, progress: 100 };
    const nextTiers = { bronze: 'silver', silver: 'gold', gold: 'platinum' };
    const nextTier = nextTiers[currentTier as keyof typeof nextTiers];
    const threshold = TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS];
    const prevThreshold = TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS];
    
    const progress = Math.min(100, Math.max(0, ((totalEarned - prevThreshold) / (threshold - prevThreshold)) * 100));
    return { name: nextTier, threshold, progress };
  };

  const nextTier = getNextTierInfo();

  const handleRedeem = async (reward: RewardItem) => {
    if (!user) return;
    if (currentPoints < reward.pointsCost) {
      toast.error('Not enough Choco Points! Keep treats-ing.');
      return;
    }

    setRedeemingId(reward.id);
    try {
      await redeemChocoPoints(user.uid, reward.pointsCost, reward.id, reward.name);
      toast.success(`Exclusive reward redeemed: ${reward.name}! ✨ Check your email.`);
      loadHistory();
    } catch (error: any) {
      toast.error(error.message || 'Redemption failed');
    } finally {
      setRedeemingId(null);
    }
  };

  const getTierIcon = (t: string) => {
    switch(t) {
      case 'platinum': return <Crown className="w-8 h-8 text-[#E5E4E2]" />;
      case 'gold': return <Crown className="w-8 h-8 text-[#D4AF37]" />;
      case 'silver': return <Star className="w-8 h-8 text-gray-300" />;
      default: return <Trophy className="w-8 h-8 text-[#B8860B]" />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* SECTION 1: Status Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-dark border border-[#3E2723]/50 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-display font-bold text-[#FFF3E0] uppercase tracking-widest">Rewards Dashboard</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-end gap-10">
              <div>
                <p className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Choco Points Balance</p>
                <div className="flex items-center gap-4">
                  <span className="text-6xl md:text-8xl font-display font-bold text-[#D4AF37] leading-none drop-shadow-glow">
                    {currentPoints.toLocaleString()}
                  </span>
                  <div className="p-2 bg-[#D4AF37]/10 rounded-full text-xl">🍫</div>
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-[#FFF3E0]/40">Road to {nextTier.name} Status</span>
                  <span className="text-[#D4AF37]">{nextTier.threshold - totalEarned} Points to go</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${nextTier.progress}%` }}
                     className="h-full gold-gradient rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                     transition={{ duration: 1.5, ease: 'easeOut' }}
                   />
                </div>
                <p className="text-[10px] text-[#FFF3E0]/20 font-medium italic">
                  *Accumulate {nextTier.threshold.toLocaleString()} lifetime points to reach {nextTier.name} tier.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A0F0B] to-[#0D0705] border border-[#D4AF37]/20 rounded-[40px] p-8 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/10 group-hover:bg-[#D4AF37]/10 transition-all">
               {getTierIcon(currentTier)}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-1">Current Standing</p>
              <p className="text-2xl font-display font-bold text-[#FFF3E0] capitalize">{currentTier}</p>
            </div>
          </div>
          <div className="space-y-3">
             {getTierBenefits(currentTier).map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-[#FFF3E0]/60 font-medium group-hover:text-[#FFF3E0]/80 transition-all">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  {benefit}
                </div>
             ))}
          </div>
          <button className="mt-8 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all pb-1 w-fit">
            Explore All Tier Benefits
          </button>
        </div>
      </div>

      {/* SECTION 2: Rewards Store */}
      <div>
        <div className="flex items-end justify-between mb-8 px-4">
          <div>
            <h3 className="text-3xl font-display font-bold text-[#FFF3E0] uppercase tracking-tight">The <span className="text-[#D4AF37]">Artisan Shop</span></h3>
            <p className="text-xs text-[#FFF3E0]/30 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Redeem points for exclusive rewards
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-[#FFF3E0]/40">
            <span>Filter by:</span>
            <button className="text-[#D4AF37]">All</button>
            <button className="hover:text-[#D4AF37] transition-all">Discounts</button>
            <button className="hover:text-[#D4AF37] transition-all">Exclusive</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {getRewardsStore().map((item, idx) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="glass-dark border border-[#3E2723]/50 rounded-[32px] overflow-hidden group hover:border-[#D4AF37]/40 transition-all flex flex-col"
             >
               <div className="relative aspect-video overflow-hidden bg-[#1A0F0B]">
                 {item.image ? (
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[#FFF3E0]/5">
                     <ShoppingBag className="w-12 h-12" />
                   </div>
                 )}
                 <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-[#FFF3E0]/40">
                   {item.category === 'Discounts' ? <Tag className="w-4 h-4" /> : item.category === 'Free Delivery' ? <Truck className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                 </div>
               </div>
               <div className="p-6 flex flex-col flex-1">
                 <h4 className="text-lg font-bold text-[#FFF3E0] mb-2 leading-tight group-hover:text-[#D4AF37] transition-colors">{item.name}</h4>
                 <p className="text-xs text-[#FFF3E0]/40 leading-relaxed flex-1 mb-6">{item.description}</p>
                 <div className="mt-auto border-t border-[#3E2723]/50 pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-widest leading-none mb-1">Cost</p>
                      <p className="text-xl font-display font-bold text-[#D4AF37] leading-none">{item.pointsCost.toLocaleString()} 🍫</p>
                    </div>
                    <button 
                      onClick={() => handleRedeem(item)}
                      disabled={redeemingId !== null || currentPoints < item.pointsCost}
                      className={`p-3 rounded-full transition-all active:scale-95 ${currentPoints >= item.pointsCost ? 'bg-[#D4AF37] text-[#1A0F0B] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-[#FFF3E0]/20 cursor-not-allowed'}`}
                    >
                      {redeemingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                 </div>
               </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* SECTION 4: Transaction History */}
      <div className="glass-dark border border-[#3E2723]/30 rounded-[40px] p-8 md:p-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <History className="w-5 h-5 text-[#D4AF37]" />
             </div>
             <div>
               <h4 className="text-xl font-display font-bold text-[#FFF3E0] uppercase tracking-tight">Ledger History</h4>
               <p className="text-[10px] text-[#FFF3E0]/30 font-bold uppercase tracking-widest mt-1">Audit of your choco points activity</p>
             </div>
          </div>
          <button className="text-[10px] font-bold text-[#FFF3E0]/20 uppercase tracking-widest hover:text-[#FFF3E0] transition-all">Download Report</button>
        </div>

        <div className="space-y-3">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 glass-dark border border-white/5 rounded-2xl animate-pulse" />
             ))
          ) : history.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[#3E2723] rounded-[32px]">
               <TrendingUp className="w-10 h-10 text-[#FFF3E0]/5 mx-auto mb-4" />
               <p className="text-[#FFF3E0]/40 text-xs font-bold uppercase tracking-widest">No activity recorded yet in your artisan ledger.</p>
            </div>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="bg-[#1A0F0B] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-[#D4AF37]/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-all ${tx.type === 'earned' ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'}`}>
                    {tx.type === 'earned' ? <TrendingUp className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#FFF3E0] text-sm group-hover:text-[#D4AF37] transition-colors">{tx.reason}</h5>
                    <p className="text-[10px] text-[#FFF3E0]/30 uppercase font-bold tracking-widest mt-0.5">
                      {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : 'Processing...'}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-display font-bold ${tx.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'earned' ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
