'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Menu, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { SoundToggle } from './SoundToggle';

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: Search },
    { name: 'Cart', href: '/cart', icon: ShoppingBag },
    { name: 'Profile', href: '/profile', icon: User },
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
