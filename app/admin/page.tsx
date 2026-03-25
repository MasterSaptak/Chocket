'use client';

import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  TrendingUp, DollarSign, AlertCircle, Bell, Search, Menu, LogOut, Plus, Edit, Trash2, Eye, EyeOff, Loader2,
  CheckCircle, Clock, Truck, XCircle, MessageSquare, ChevronRight, Shield, UserCheck, UserX, Ban, ArrowUpCircle, FileText, ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Image from 'next/image';
import { Product } from '@/components/ProductCard';
import { getAllProducts, addProduct, updateProduct, deleteProduct, deleteProducts, subscribeToProducts } from '@/lib/products';
import { ProductModal } from '@/components/ProductModal';
import { OrderDetailsModal } from '@/components/OrderDetailsModal';
import { ReviewsModal } from '@/components/ReviewsModal';
import { getAllOrders, updateOrderStatus, updateOrdersStatus, Order, subscribeToOrders } from '@/lib/orders';
import { seedReviewsIfEmpty } from '@/lib/reviews';
import { subscribeToUsers, updateUserRole, updateUserStatus } from '@/lib/users';
import { subscribeToApplications, approveApplication, rejectApplication } from '@/lib/sellerApplications';
import { useAuth } from '@/components/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import type { ChocketUser, UserRole, SellerApplication } from '@/types';

const data = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

function AdminDashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBuyingPrice, setShowBuyingPrice] = useState<Record<string, boolean>>({});
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // User management state
  const [allUsers, setAllUsers] = useState<ChocketUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [sellerApplications, setSellerApplications] = useState<SellerApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const { user: currentAuthUser, userData } = useAuth();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    const unsubscribeProducts = subscribeToProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
      setIsLoadingProducts(false);
    });

    const unsubscribeOrders = subscribeToOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoadingOrders(false);
    });

    const unsubscribeUsers = subscribeToUsers((fetchedUsers) => {
      setAllUsers(fetchedUsers);
      setIsLoadingUsers(false);
    });

    const unsubscribeApps = subscribeToApplications((fetchedApps) => {
      setSellerApplications(fetchedApps);
      setIsLoadingApplications(false);
    });

    seedReviewsIfEmpty();

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeApps();
    };
  }, []);

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await addProduct(productData);
        toast.success('Product added successfully');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      
      // Update local state for both lists
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleBulkDeleteProducts = async () => {
    if (selectedProducts.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;

    setIsBulkUpdating(true);
    try {
      await deleteProducts(Array.from(selectedProducts));
      toast.success(`${selectedProducts.size} products deleted successfully`);
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to delete some products');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkUpdateOrderStatus = async (status: Order['status']) => {
    if (selectedOrders.size === 0) return;
    
    setIsBulkUpdating(true);
    try {
      await updateOrdersStatus(Array.from(selectedOrders), status);
      toast.success(`Updated ${selectedOrders.size} orders to ${status}`);
      setSelectedOrders(new Set());
    } catch (error) {
      console.error('Error in bulk status update:', error);
      toast.error('Failed to update some orders');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleProductSelection = (id: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProducts(newSelection);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleOrderSelection = (id: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedOrders(newSelection);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const openReviewsModal = (product: Product) => {
    setSelectedProductForReviews(product);
    setIsReviewsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // User management handlers
  const handlePromoteUser = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      toast.success(`User promoted to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleBanUser = async (uid: string) => {
    try {
      await updateUserStatus(uid, 'banned');
      toast.success('User has been banned');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleActivateUser = async (uid: string) => {
    try {
      await updateUserStatus(uid, 'active');
      toast.success('User has been activated');
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleApproveApp = async (appId: string, userId: string) => {
    if (!currentAuthUser) return;
    try {
      await approveApplication(appId, userId, currentAuthUser.uid);
      toast.success('Application approved! User is now a seller.');
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleRejectApp = async (appId: string) => {
    if (!currentAuthUser) return;
    try {
      await rejectApplication(appId, currentAuthUser.uid, rejectReason);
      toast.success('Application rejected');
      setRejectingAppId(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const filteredApplications = sellerApplications.filter(app => 
    applicationFilter === 'all' || app.status === applicationFilter
  );

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = sellerApplications.filter(a => a.status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'usermgmt', label: 'User Management', icon: Shield },
    { id: 'sellerapps', label: 'Seller Applications', icon: FileText, badge: pendingApplications },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const toggleBuyingPrice = (id: string) => {
    setShowBuyingPrice(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate dashboard stats
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockItems = products.filter(p => (p.stock || 0) < 10);
  const lowStockProducts = lowStockItems.length;

  // Aggregate customers
  const customersMap = new Map();
  orders.forEach(order => {
    const email = order.customerInfo?.email || `${order.userId}@guest.com`;
    if (!customersMap.has(email)) {
      customersMap.set(email, {
        id: order.userId,
        name: `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim() || 'Guest User',
        email: email,
        totalOrders: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: order.createdAt,
      });
    } else {
      const customer = customersMap.get(email);
      customer.totalOrders += 1;
      customer.totalSpent += order.totalAmount;
      if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.createdAt;
      }
    }
  });
  const customers = Array.from(customersMap.values());

  const orderStatusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#EAB308' },
    { name: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#3B82F6' },
    { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#A855F7' },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          `${o.customerInfo?.firstName} ${o.customerInfo?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock className="w-3 h-3" /> Pending</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0D0705] text-[#FFF3E0] flex font-sans selection:bg-[#D4AF37] selection:text-[#1A0F0B]">
      {/* Prime Admin Luxury Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen bg-[#1A0F0B] border-r border-[#3E2723] transform transition-transform duration-300 flex flex-col shadow-2xl shadow-black/50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h1 className="text-2xl font-display font-bold text-[#FFF3E0] tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
                Chocket<span className="text-[#D4AF37]">Admin</span>
              </h1>
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold mt-1">Prime Command Center</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] bg-white/5 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="w-full relative z-10 flex items-center gap-3 px-4 py-3 bg-[#0D0705]/60 hover:bg-[#D4AF37]/10 text-[#FFF3E0]/80 hover:text-[#D4AF37] border border-[#3E2723] rounded-xl transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">Back to Store</span>
          </button>
        </div>

        <nav className="px-4 space-y-2 mt-4 flex-1 overflow-y-auto hide-scrollbar relative z-10">
          <div className="text-[10px] font-bold text-[#FFF3E0]/30 uppercase tracking-widest px-4 mb-4">Core Modules</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5' 
                    : 'text-[#FFF3E0]/50 hover:bg-white/5 hover:text-[#FFF3E0] border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-[#FFF3E0]/40'}`} />
                <span>{item.label}</span>
                {(item as any).badge > 0 && (
                  <span className={`ml-auto w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${isActive ? 'bg-[#D4AF37] text-[#1A0F0B]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {(item as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#3E2723] relative z-10">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 text-[#1A0F0B] font-bold">
              {currentAuthUser?.email?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#FFF3E0] truncate">{currentAuthUser?.displayName || 'Prime Admin'}</p>
              <p className="text-[10px] text-[#FFF3E0]/40 capitalize">{userData?.role || 'Prime Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 uppercase tracking-widest text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            System Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

        {/* Top Header */}
        <header className="h-20 bg-[#2C1A12]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37]">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#FFF3E0]/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products..." 
                className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-full focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 w-64 transition-all focus:w-80 text-[#FFF3E0] placeholder:text-[#FFF3E0]/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {lowStockProducts > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-[#1A0F0B] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10 bg-[#2C1A12]/50 flex items-center justify-between">
                        <h3 className="font-bold text-[#FFF3E0]">Notifications</h3>
                        {lowStockProducts > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 uppercase tracking-wider">
                            {lowStockProducts} Alerts
                          </span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {lowStockProducts === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-[#FFF3E0]/20 mx-auto mb-2" />
                            <p className="text-sm text-[#FFF3E0]/40">No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {lowStockItems.map((item) => (
                              <div 
                                key={item.id} 
                                className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                onClick={() => {
                                  setActiveTab('products');
                                  setSearchQuery(item.name);
                                  setIsNotificationsOpen(false);
                                }}
                              >
                                <div className="flex gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                                    <Image 
                                      src={item.images[0] || 'https://picsum.photos/seed/placeholder/600/600'} 
                                      alt={item.name} 
                                      fill 
                                      className="object-cover" 
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#FFF3E0] truncate group-hover:text-[#D4AF37] transition-colors">
                                      Low Stock: {item.name}
                                    </p>
                                    <p className="text-xs text-red-400 font-bold mt-0.5">
                                      Only {item.stock} units left
                                    </p>
                                    <p className="text-[10px] text-[#FFF3E0]/40 mt-1">
                                      Restock recommended immediately
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-[#2C1A12]/30 border-t border-white/10 text-center">
                        <button 
                          onClick={() => {
                            setActiveTab('products');
                            setIsNotificationsOpen(false);
                          }}
                          className="text-xs font-bold text-[#D4AF37] hover:underline"
                        >
                          View all products
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] flex items-center justify-center font-bold shadow-lg border border-[#D4AF37]/50">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Overview</h2>
                <select className="bg-[#2C1A12] border border-white/10 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#D4AF37]/50 text-[#FFF3E0]">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Year</option>
                </select>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', positive: true },
                  { title: 'Orders', value: totalOrders.toString(), icon: ShoppingCart, trend: '+5.2%', positive: true },
                  { title: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, trend: '-2', positive: false },
                  { title: 'Low Stock Alerts', value: lowStockProducts.toString(), icon: AlertCircle, trend: '-2', positive: false },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#2C1A12]/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl hover:border-[#D4AF37]/30 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl transition-colors ${stat.positive ? 'bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20' : 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-bold ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-[#FFF3E0]/60 font-medium mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-[#FFF3E0]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#2C1A12]/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                  <h3 className="text-lg font-display font-bold text-[#FFF3E0] mb-6">Revenue vs Profit</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A0F0B', borderColor: 'rgba(212,175,55,0.3)', borderRadius: '12px', color: '#FFF3E0' }}
                          itemStyle={{ color: '#D4AF37' }}
                        />
                        <Bar dataKey="sales" fill="#3E2723" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#2C1A12]/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                  <h3 className="text-lg font-display font-bold text-[#FFF3E0] mb-6">Sales Trend</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A0F0B', borderColor: 'rgba(212,175,55,0.3)', borderRadius: '12px', color: '#FFF3E0' }}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts Section */}
              {lowStockProducts > 0 && (
                <div className="bg-[#2C1A12]/60 backdrop-blur-md p-6 rounded-2xl border border-red-500/20 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold text-[#FFF3E0]">Critical Stock Alerts</h3>
                        <p className="text-sm text-[#FFF3E0]/40">The following products are running low on stock</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-sm font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      Manage Inventory <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 bg-black/20 border border-white/5 rounded-xl flex items-center gap-4 group hover:border-red-500/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab('products');
                          setSearchQuery(item.name);
                        }}
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <Image 
                            src={item.images[0] || 'https://picsum.photos/seed/placeholder/600/600'} 
                            alt={item.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#FFF3E0] truncate group-hover:text-[#D4AF37] transition-colors">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-[#FFF3E0]/60">{item.category}</span>
                            <span className="text-sm font-bold text-red-400">{item.stock} left</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.stock || 0) * 10}%` }}
                              className="h-full bg-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Products</h2>
                <button 
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-4 w-10">
                          <input 
                            type="checkbox" 
                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                            onChange={toggleAllProducts}
                            disabled={isBulkUpdating}
                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#D4AF37] focus:ring-[#D4AF37]/50 disabled:opacity-50"
                          />
                        </th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Product</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Category</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Stock</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Buying Price</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Selling Price</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Discount</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoadingProducts ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[#FFF3E0]/60">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading products...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[#FFF3E0]/60">
                            No products found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const discount = product.originalPrice
                            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                            : 0;
                          const isSelected = selectedProducts.has(product.id);
                          return (
                            <tr key={product.id} className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-[#D4AF37]/5' : ''}`}>
                              <td className="p-4">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => toggleProductSelection(product.id)}
                                  disabled={isBulkUpdating}
                                  className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#D4AF37] focus:ring-[#D4AF37]/50 disabled:opacity-50"
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <Image src={product.images[0] || 'https://picsum.photos/seed/placeholder/600/600'} alt={product.name} fill className="object-cover" />
                                    {discount > 0 && (
                                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-bl-md shadow-sm">
                                        -{discount}%
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-[#FFF3E0]">{product.name}</span>
                                    {discount > 0 && (
                                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Sale: {discount}% Off
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-[#FFF3E0]/80">{product.category}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (product.stock || 0) > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  (product.stock || 0) > 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                  'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#FFF3E0]/60 font-mono">
                                    {showBuyingPrice[product.id] ? `₹${product.buyingPrice || 0}` : '••••••'}
                                  </span>
                                  <button 
                                    onClick={() => toggleBuyingPrice(product.id)}
                                    className="text-[#FFF3E0]/40 hover:text-[#D4AF37] transition-colors p-1"
                                  >
                                    {showBuyingPrice[product.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 font-medium text-[#D4AF37]">₹{product.price}</td>
                              <td className="p-4">
                                {discount > 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm">
                                    {discount}% OFF
                                  </span>
                                ) : (
                                  <span className="text-[#FFF3E0]/40">-</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => openReviewsModal(product)}
                                    className="p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                                    title="View Reviews"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => openEditModal(product)}
                                    className="p-2 text-[#FFF3E0]/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-[#FFF3E0]/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bulk Action Bar for Products */}
              <AnimatePresence>
                {selectedProducts.size > 0 && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C1A12] border border-[#D4AF37]/30 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                      <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#1A0F0B] flex items-center justify-center font-bold text-sm">
                        {selectedProducts.size}
                      </span>
                      <span className="text-sm font-medium text-[#FFF3E0]">Products Selected</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleBulkDeleteProducts}
                        disabled={isBulkUpdating}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-400/20 rounded-xl transition-colors text-sm font-semibold disabled:opacity-50"
                      >
                        {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete Selected
                      </button>
                      <button 
                        onClick={() => setSelectedProducts(new Set())}
                        disabled={isBulkUpdating}
                        className="px-4 py-2 text-[#FFF3E0]/60 hover:text-[#FFF3E0] transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Orders</h2>
                <select 
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#2C1A12] border border-white/10 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#D4AF37]/50 text-[#FFF3E0]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-4 w-10">
                          <input 
                            type="checkbox" 
                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                            onChange={toggleAllOrders}
                            disabled={isBulkUpdating}
                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#D4AF37] focus:ring-[#D4AF37]/50 disabled:opacity-50"
                          />
                        </th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Order ID</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Customer</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Date</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Total</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Status</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#FFF3E0]/60">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading orders...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#FFF3E0]/60">
                            No orders found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const isSelected = selectedOrders.has(order.id);
                          return (
                            <tr 
                              key={order.id} 
                              onClick={() => openOrderDetails(order)}
                              className={`hover:bg-white/5 transition-colors cursor-pointer group/row ${isSelected ? 'bg-[#D4AF37]/5' : ''}`}
                            >
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => toggleOrderSelection(order.id)}
                                  disabled={isBulkUpdating}
                                  className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#D4AF37] focus:ring-[#D4AF37]/50 disabled:opacity-50"
                                />
                              </td>
                              <td className="p-4 font-mono text-sm text-[#FFF3E0]/80 group-hover/row:text-[#D4AF37] transition-colors">
                                {order.id.slice(0, 8)}...
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#FFF3E0]">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</span>
                                  <span className="text-xs text-[#FFF3E0]/60">{order.customerInfo?.email || 'Guest'}</span>
                                </div>
                              </td>
                              <td className="p-4 text-[#FFF3E0]/80 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 font-medium text-[#D4AF37]">₹{order.totalAmount}</td>
                              <td className="p-4">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <select 
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                  disabled={isBulkUpdating}
                                  className="bg-[#1A0F0B] border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-[#D4AF37]/50 text-[#FFF3E0] relative z-10 disabled:opacity-50"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bulk Action Bar for Orders */}
              <AnimatePresence>
                {selectedOrders.size > 0 && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C1A12] border border-[#D4AF37]/30 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                      <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#1A0F0B] flex items-center justify-center font-bold text-sm">
                        {selectedOrders.size}
                      </span>
                      <span className="text-sm font-medium text-[#FFF3E0]">Orders Selected</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#FFF3E0]/40 uppercase tracking-wider font-bold">Update Status:</span>
                        <div className="flex gap-2">
                          {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleBulkUpdateOrderStatus(status as Order['status'])}
                              disabled={isBulkUpdating}
                              className="px-3 py-1.5 bg-white/5 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-lg transition-all text-xs font-semibold border border-white/10 hover:border-[#D4AF37]/30 disabled:opacity-50 capitalize"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/10 mx-2" />
                      <button 
                        onClick={() => setSelectedOrders(new Set())}
                        disabled={isBulkUpdating}
                        className="px-4 py-2 text-[#FFF3E0]/60 hover:text-[#FFF3E0] transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Customers</h2>
              </div>

              <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Name</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Email</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Total Orders</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Total Spent</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Last Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/60">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading customers...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/60">
                            No customers found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-[#FFF3E0]">{customer.name}</td>
                            <td className="p-4 text-[#FFF3E0]/80">{customer.email}</td>
                            <td className="p-4 text-[#FFF3E0]/80">{customer.totalOrders}</td>
                            <td className="p-4 font-medium text-[#D4AF37]">₹{customer.totalSpent}</td>
                            <td className="p-4 text-[#FFF3E0]/80 text-sm">
                              {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* User Management Tab */}
          {activeTab === 'usermgmt' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">User Management</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#FFF3E0]/40">{allUsers.length} total users</span>
                </div>
              </div>

              <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">User</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Email</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Role</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider">Status</th>
                        <th className="p-4 font-medium text-[#FFF3E0]/60 text-sm uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/60">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading users...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#FFF3E0]/60">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-[#1A0F0B] font-bold text-sm">
                                  {(u.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[#FFF3E0]">{u.name || 'Unknown'}</p>
                                  <p className="text-xs text-[#FFF3E0]/40">{u.uid.slice(0, 12)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-[#FFF3E0]/80">{u.email}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                u.role === 'primeadmin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                u.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                u.role === 'seller' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                              }`}>
                                <Shield className="w-3 h-3" />
                                {u.role === 'primeadmin' ? 'Prime Admin' : u.role === 'manager' ? 'Manager' : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                {u.status === 'active' ? 'Active' : 'Banned'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={u.role}
                                  onChange={(e) => handlePromoteUser(u.uid, e.target.value as UserRole)}
                                  // Manager can only toggle between buyer and seller, and only for buyers and sellers
                                  disabled={
                                    userData?.role !== 'primeadmin' && 
                                    (u.role === 'manager' || u.role === 'primeadmin' || !['buyer', 'seller'].includes(u.role))
                                  }
                                  className="bg-[#1A0F0B] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-[#D4AF37]/50 text-[#FFF3E0] disabled:opacity-50"
                                >
                                  <option value="buyer">Buyer</option>
                                  <option value="seller">Seller</option>
                                  {(userData?.role === 'primeadmin' || u.role === 'manager') && (
                                    <option value="manager">Manager</option>
                                  )}
                                  {u.role === 'primeadmin' && (
                                    <option value="primeadmin">Prime Admin</option>
                                  )}
                                </select>
                                {u.status === 'active' ? (
                                  <button
                                    onClick={() => handleBanUser(u.uid)}
                                    disabled={userData?.role !== 'primeadmin' && (u.role === 'manager' || u.role === 'primeadmin' || !['buyer', 'seller'].includes(u.role))}
                                    className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Ban className="w-3 h-3" /> Ban
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivateUser(u.uid)}
                                    disabled={userData?.role !== 'primeadmin' && (u.role === 'manager' || u.role === 'primeadmin' || !['buyer', 'seller'].includes(u.role))}
                                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Activate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seller Applications Tab */}
          {activeTab === 'sellerapps' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Seller Applications</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={applicationFilter}
                    onChange={(e) => setApplicationFilter(e.target.value)}
                    className="bg-[#2C1A12] border border-white/10 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#D4AF37]/50 text-[#FFF3E0]"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {isLoadingApplications ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
                  <FileText className="w-12 h-12 text-[#FFF3E0]/20 mx-auto mb-4" />
                  <p className="text-[#FFF3E0]/40">No applications found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border shadow-xl overflow-hidden ${
                        app.status === 'pending' ? 'border-yellow-500/20' :
                        app.status === 'approved' ? 'border-emerald-500/20' : 'border-red-500/20'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-[#1A0F0B] font-bold">
                                {app.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-[#FFF3E0]">{app.fullName}</h3>
                                <p className="text-xs text-[#FFF3E0]/40">{app.email} • {app.phone}</p>
                              </div>
                              <span className={`ml-auto md:ml-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                                app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {app.status === 'pending' ? <Clock className="w-3 h-3" /> :
                                 app.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                              <div className="bg-black/20 rounded-xl p-3">
                                <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider mb-1">Location</p>
                                <p className="text-sm text-[#FFF3E0]/80">{app.location}</p>
                              </div>
                              <div className="bg-black/20 rounded-xl p-3">
                                <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider mb-1">Platform</p>
                                <p className="text-sm text-[#FFF3E0]/80">{app.sellingPlatform}</p>
                              </div>
                              <div className="bg-black/20 rounded-xl p-3 col-span-2">
                                <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider mb-1">Experience</p>
                                <p className="text-sm text-[#FFF3E0]/80 line-clamp-2">{app.experience}</p>
                              </div>
                            </div>

                            {app.identityProof && (
                              <a
                                href={app.identityProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:underline mt-2"
                              >
                                <Eye className="w-3 h-3" /> View Identity Proof
                              </a>
                            )}
                          </div>

                          {/* Actions for pending applications */}
                          {app.status === 'pending' && (
                            <div className="flex md:flex-col gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveApp(app.id, app.userId)}
                                className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2 border border-emerald-500/20"
                              >
                                <UserCheck className="w-4 h-4" /> Approve
                              </button>
                              {rejectingAppId === app.id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Reason (optional)"
                                    className="w-full px-3 py-2 bg-black/20 border border-red-500/20 rounded-lg text-sm text-[#FFF3E0] placeholder:text-[#FFF3E0]/20 focus:outline-none focus:border-red-500/50"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRejectApp(app.id)}
                                      className="flex-1 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold border border-red-500/20"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => { setRejectingAppId(null); setRejectReason(''); }}
                                      className="px-3 py-2 text-[#FFF3E0]/40 hover:text-[#FFF3E0] text-xs font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setRejectingAppId(app.id)}
                                  className="flex-1 md:flex-none px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2 border border-red-500/20"
                                >
                                  <UserX className="w-4 h-4" /> Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-[#FFF3E0]">Settings</h2>
              </div>

              <div className="bg-[#2C1A12]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden p-6 md:p-8">
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); toast.success('Settings saved successfully'); }}>
                  {/* General Settings */}
                  <section>
                    <h3 className="text-xl font-semibold text-[#FFF3E0] mb-4 border-b border-white/10 pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFF3E0]/60">Store Name</label>
                        <input type="text" defaultValue="Chocket" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFF3E0]/60">Contact Email</label>
                        <input type="email" defaultValue="admin@chocket.com" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFF3E0]/60">Phone Number</label>
                        <input type="tel" defaultValue="+1 234 567 8900" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFF3E0]/60">Currency</label>
                        <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all">
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Store Address */}
                  <section>
                    <h3 className="text-xl font-semibold text-[#FFF3E0] mb-4 border-b border-white/10 pb-2">Store Address</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFF3E0]/60">Street Address</label>
                        <input type="text" defaultValue="123 Chocolate Avenue" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#FFF3E0]/60">City</label>
                          <input type="text" defaultValue="Mumbai" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#FFF3E0]/60">State</label>
                          <input type="text" defaultValue="Maharashtra" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#FFF3E0]/60">ZIP Code</label>
                          <input type="text" defaultValue="400001" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[#FFF3E0] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all" />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A0F0B] font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleUpdateOrderStatus}
      />

      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        product={selectedProductForReviews}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RouteGuard allowedRoles={['manager', 'primeadmin']}>
      <AdminDashboardContent />
    </RouteGuard>
  );
}
