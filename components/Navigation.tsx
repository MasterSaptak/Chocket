'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Menu, Bell, Shield, Store, LogOut, Crown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { useAuth } from './AuthProvider';
import { SoundToggle } from './SoundToggle';
import { logout } from '@/lib/auth';
import { getRoleDisplayName, getRoleColor } from '@/lib/rbac';
import { toast } from 'sonner';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { user, userData, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide nav on admin/seller dashboard/superadmin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/superadmin') || pathname?.startsWith('/seller/dashboard')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      setShowUserMenu(false);
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { name: 'Shop', href: '/shop', icon: Search },
    { name: 'Brands', href: '/brands', icon: Search },
    { name: 'Gifts', href: '/gifts', icon: ShoppingBag },
    { name: 'Orders', href: user ? '/profile?tab=orders' : '/auth', icon: ShoppingBag },
    { name: 'Profile', href: user ? '/profile' : '/auth', icon: User },
  ];

  const notifications = [
    { id: 1, title: 'Flash Sale!', message: 'Get 20% off on all Swiss chocolates today.', time: '2h ago', unread: true },
    { id: 2, title: 'Back in Stock', message: 'Belgian Hazelnut Praline is now available.', time: '5h ago', unread: true },
    { id: 3, title: 'Order Shipped', message: 'Your order #CHK-9823471 is on the way.', time: '1d ago', unread: false },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block ${
          isScrolled
            ? 'glass-dark py-3 shadow-2xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-3xl font-display font-bold tracking-tight text-[#FFF3E0] hover:text-[#D4AF37] transition-colors duration-300"
          >
            Chocket<span className="text-[#D4AF37]">.</span>
          </Link>

          <nav className="flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-all duration-300 hover:text-[#D4AF37] hover:scale-110 relative group ${
                  pathname === item.href
                    ? 'text-[#D4AF37]'
                    : 'text-[#FFF3E0]/70'
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2.5px] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full transition-all duration-300 ${
                    pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
            {/* Role-based links — hidden from public nav, accessible via dashboards */}
          </nav>

          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <SoundToggle />

            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#FFF3E0]/70 hover:text-[#D4AF37]">
              <Search className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-[#FFF3E0]/70 hover:text-[#D4AF37]"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full gold-glow" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-[#1A0F0B] rounded-2xl shadow-2xl border border-[#3E2723] overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-[#3E2723] flex justify-between items-center bg-[#0D0705]/50">
                        <h3 className="font-semibold text-[#FFF3E0]">Notifications</h3>
                        <button className="text-xs text-[#D4AF37] hover:underline">Mark all as read</button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-[#3E2723]/50 hover:bg-white/5 transition-colors cursor-pointer ${
                              notif.unread ? 'bg-[#D4AF37]/5' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium ${notif.unread ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/80'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-xs text-[#FFF3E0]/40">{notif.time}</span>
                            </div>
                            <p className="text-xs text-[#FFF3E0]/50 line-clamp-2">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center border-t border-[#3E2723] bg-[#0D0705]/50">
                        <button className="text-sm font-medium text-[#D4AF37] hover:text-[#FFF3E0] transition-colors">
                          View All
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-[#FFF3E0]/70 hover:text-[#D4AF37]"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 ? (
                <motion.span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#1A0F0B] text-xs font-bold flex items-center justify-center rounded-full shadow-md"
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {totalItems}
                </motion.span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full gold-glow" />
              )}
            </Link>

            {/* User avatar / Auth button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                    role === 'primeadmin' ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white border-purple-400/50' :
                    role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400/50' :
                    role === 'seller' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-emerald-400/50' :
                    'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] border-[#D4AF37]/50'
                  } hover:scale-110`}
                >
                  {(userData?.name || user.email || 'U').charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-[#1A0F0B] rounded-2xl shadow-2xl border border-[#3E2723] overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-[#3E2723] bg-[#0D0705]/50">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#FFF3E0] text-sm truncate">
                              {userData?.name || user.displayName || 'Loading...'}
                            </p>
                            {user.emailVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                            )}
                          </div>
                          <p className="text-xs text-[#FFF3E0]/40 truncate">{user.email || 'No email'}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              role === 'primeadmin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-sm shadow-purple-500/10' :
                              role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm shadow-blue-500/10' :
                              role === 'seller' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10' :
                              'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 shadow-sm shadow-[#D4AF37]/10'
                            }`}>
                              <Shield className="w-2.5 h-2.5" />
                              {getRoleDisplayName(role)}
                            </span>
                            
                            {!user.emailVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-2">
                          <Link href="/profile" onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#FFF3E0]/70 hover:text-[#FFF3E0] hover:bg-white/5 transition-colors text-sm">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          {role === 'buyer' && (
                            <Link href="/seller/apply" onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors text-sm">
                              <Store className="w-4 h-4" /> Apply as Seller
                            </Link>
                          )}
                          {role === 'seller' && (
                            <Link href="/seller/dashboard" onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors text-sm">
                              <Store className="w-4 h-4" /> Seller Dashboard
                            </Link>
                          )}
                          {(role === 'manager' || role === 'primeadmin') && (
                            <Link href="/admin" onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/5 transition-colors text-sm">
                              <Shield className="w-4 h-4" /> Manager Dashboard
                            </Link>
                          )}
                          {role === 'primeadmin' && (
                            <Link href="/superadmin/dashboard" onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/5 transition-colors text-sm">
                              <Crown className="w-4 h-4" /> Prime Admin
                            </Link>
                          )}
                          <div className="my-1 border-t border-[#3E2723]" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 bg-[#D4AF37] text-[#1A0F0B] text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:hidden ${
          isScrolled
            ? 'glass-dark py-3 shadow-lg'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-[#FFF3E0]">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="text-2xl font-display font-bold tracking-tight text-[#FFF3E0]">
            Chocket<span className="text-[#D4AF37]">.</span>
          </Link>
          <div className="flex items-center gap-1">
            <SoundToggle />
            <button className="p-2 relative text-[#FFF3E0]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full gold-glow" />
            </button>
            <Link href="/cart" className="p-2 -mr-2 relative text-[#FFF3E0]">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#1A0F0B] text-xs font-bold flex items-center justify-center rounded-full shadow-md">
                  {totalItems}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full gold-glow" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark pb-safe md:hidden border-t border-[#3E2723]/50">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative p-3 flex flex-col items-center gap-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-[#D4AF37]/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 z-10 transition-colors ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/50'
                    }`}
                  />
                  {item.name === 'Cart' && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4AF37] text-[#1A0F0B] text-[10px] font-bold flex items-center justify-center rounded-full shadow-md z-20">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium z-10 transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/50'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
