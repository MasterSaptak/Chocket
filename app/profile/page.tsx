'use client';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Heart, Package, Settings, LogOut, ChevronRight, Edit3, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile } from '@/lib/users';

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');
  const [isVerified, setIsVerified] = useState(user?.emailVerified || false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  // Sync state with userData
  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setDob(userData.dob || '');
    }
  }, [userData]);

  // Auto-refresh verification status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user && !isVerified) {
      interval = setInterval(() => {
        user.reload().then(() => {
          if (auth.currentUser?.emailVerified) {
            setIsVerified(true);
            toast.success('Email successfully verified! ✅');
          }
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user, isVerified]);

  const handleSave = async () => {
    if (!user) {
      toast.error('No user found');
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile (DisplayName)
      console.log('Updating Auth profile for:', name);
      await updateProfile(user, { displayName: name });

      // 2. Update Firestore user document
      console.log('Updating Firestore profile for:', user.uid);
      await updateUserProfile(user.uid, { 
        name: name || '', 
        phone: phone || '', 
        dob: dob || '' 
      });

      toast.success('Profile updated successfully! ✨');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Dummy data arrays for showcasing the structure while Firebase builds up history
  const orders = [
    { id: '1', orderNo: '#CHK-928421', date: 'Oct 12, 2024', total: '₹4,500', status: 'Delivered', items: 3 },
    { id: '2', orderNo: '#CHK-394857', date: 'Sep 28, 2024', total: '₹2,100', status: 'Processing', items: 1 }
  ];

  const wishlist = [
    { id: 'w1', name: 'Swiss Alp Truffles', image: 'https://picsum.photos/seed/choco1/200/200', price: '₹1,500' },
    { id: 'w2', name: 'Dark Chocolate Core', image: 'https://picsum.photos/seed/choco2/200/200', price: '₹850' }
  ];

  const addresses = [
    { id: 'a1', type: 'Home', full: '123 Chocolate Avenue, Sweetville, NY 10012, United States', default: true },
    { id: 'a2', type: 'Work', full: '45 Cocoa Street, Truffle Tower, London EC1A 1BB, United Kingdom', default: false }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Details', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Linked Addresses', icon: MapPin },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0D0705] py-10 md:py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3E2723]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8"
        >
          {/* Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0">
            {/* Warning Banner if not verified */}
            {!loading && user && !isVerified && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-semibold text-sm">Not Verified ❌</h4>
                  <p className="text-red-400/80 text-xs mt-1 mb-2">
                    Please verify your email address to get full access to your account and place orders.
                  </p>
                  <button onClick={() => router.push('/verify-email')} className="text-xs font-bold text-[#1A0F0B] bg-red-400 px-3 py-1.5 rounded-lg hover:bg-red-300 transition-colors">
                    Verify Now
                  </button>
                </div>
              </div>
            )}

            <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-6 sticky top-28 shadow-2xl">
              
              {/* User Avatar Card */}
              <div className="flex flex-col items-center text-center pb-8 border-b border-[#3E2723]/50">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/30 bg-[#1A0F0B] flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-[#D4AF37]/50" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-[#D4AF37] text-[#1A0F0B] rounded-full hover:scale-110 transition-transform">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-semibold text-[#FFF3E0]">
                    {loading ? 'Loading...' : (userData?.name || user?.displayName || 'Chocolate Lover')}
                  </h2>
                  {/* Verified Badge */}
                  {!loading && user && (
                    isVerified ? (
                      <span title="Verified ✅" className="flex items-center justify-center bg-green-500/20 text-green-400 p-1 rounded-full border border-green-500/30">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <span title="Not Verified ❌" className="flex items-center justify-center bg-red-500/20 text-red-400 p-1 rounded-full border border-red-500/30">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm text-[#FFF3E0]/50 mt-1">
                  {user?.email || 'premium.member@chocket.com'}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">Gold Tier Member</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="py-6 flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                          : 'text-[#FFF3E0]/70 hover:bg-white/5 hover:text-[#FFF3E0] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#3E2723]/50 flex flex-col gap-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-[#FFF3E0]/50 hover:text-[#FFF3E0] hover:bg-white/5 transition-colors text-sm font-medium">
                  <Settings className="w-5 h-5" />
                  Settings & Privacy
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>

            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8">
                    <h3 className="text-2xl font-display font-semibold text-[#FFF3E0] mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Chocolate Lover"
                          className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || "premium.member@chocket.com"}
                          disabled
                          className="w-full bg-[#1A0F0B]/50 border border-[#3E2723]/50 rounded-xl px-4 py-3 text-[#FFF3E0]/30 cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Phone Number</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-[#FFF3E0]/50 uppercase tracking-wider font-medium">Date of Birth (For Birthday Treats!)</label>
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8] font-medium"
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gold-gradient text-[#1A0F0B] px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8">
                    <h3 className="text-2xl font-display font-semibold text-[#FFF3E0] mb-6">Recent Orders</h3>
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div key={order.id} className="bg-[#1A0F0B] border border-[#3E2723] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#D4AF37]/30 transition-colors">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-[#FFF3E0]">{order.orderNo}</span>
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-[#FFF3E0]/50">Placed on {order.date} • {order.items} items</p>
                            </div>
                            <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3E2723]">
                              <span className="font-bold text-[#FFF3E0] text-lg">{order.total}</span>
                              <button className="ml-auto px-4 py-2 border border-[#D4AF37]/50 text-[#D4AF37] rounded-full text-sm font-medium hover:bg-[#D4AF37]/10 transition-colors whitespace-nowrap">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-[#FFF3E0]/20 mx-auto mb-4" />
                        <p className="text-[#FFF3E0]/60">You haven't placed any orders yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8">
                    <h3 className="text-2xl font-display font-semibold text-[#FFF3E0] mb-6">My Wishlist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlist.map(item => (
                        <div key={item.id} className="bg-[#1A0F0B] border border-[#3E2723] rounded-2xl p-4 flex gap-4 hidden-scroll">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#2C1A12] flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col justify-center flex-1">
                            <h4 className="font-medium text-[#FFF3E0] line-clamp-1">{item.name}</h4>
                            <p className="text-[#D4AF37] font-semibold mt-1">{item.price}</p>
                            <button className="text-xs text-[#FFF3E0]/50 hover:text-red-400 mt-2 self-start flex items-center gap-1 transition-colors">
                              <Heart className="w-3 h-3 fill-current" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-dark border border-[#3E2723]/50 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-display font-semibold text-[#FFF3E0]">Saved Addresses</h3>
                      <button className="text-[#D4AF37] hover:underline text-sm font-medium">
                        + Add New
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div key={addr.id} className="relative bg-[#1A0F0B] border border-[#3E2723] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-colors">
                          {addr.default && (
                            <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Default
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-[#D4AF37]" />
                            <h4 className="font-semibold text-[#FFF3E0]">{addr.type}</h4>
                          </div>
                          <p className="text-sm text-[#FFF3E0]/60 leading-relaxed pr-12">
                            {addr.full}
                          </p>
                          <div className="mt-4 flex gap-3">
                            <button className="text-xs font-medium text-[#D4AF37] hover:underline">Edit</button>
                            <button className="text-xs font-medium text-red-400 hover:underline">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
