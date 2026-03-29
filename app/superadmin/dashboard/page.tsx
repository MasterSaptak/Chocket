'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Crown, Users, ArrowUpCircle, Ban, CheckCircle,
  Loader2, LogOut, Search, ChevronRight, AlertTriangle, UserCheck, Trash2, User
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';
import { logout } from '@/lib/auth';
import { subscribeToUsers, updateUserRole, updateUserStatus, deleteUserDocument } from '@/lib/users';
import { getRoleDisplayName, getRoleColor, getAllowedPromotionTargets, isSuperAdmin } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { toast } from 'sonner';
import type { ChocketUser, UserRole } from '@/types';

function SuperAdminContent() {
  const { userData } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ChocketUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [promotingUser, setPromotingUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handlePromote = async (uid: string, newRole: UserRole) => {
    if (!userData) return;
    try {
      await updateUserRole(uid, newRole);
      await logAction({
        action: `promote_user_to_${newRole}`,
        performedBy: userData.uid,
        role: 'primeadmin',
        targetId: uid,
        bypass: true,
      });
      toast.success(`User promoted to ${getRoleDisplayName(newRole)}`);
      setPromotingUser(null);
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleBan = async (uid: string) => {
    if (!userData) return;
    try {
      await updateUserStatus(uid, 'banned');
      await logAction({
        action: 'ban_user',
        performedBy: userData.uid,
        role: 'primeadmin',
        targetId: uid,
        bypass: true,
      });
      toast.success('User banned');
    } catch {
      toast.error('Failed to ban user');
    }
  };

  const handleActivate = async (uid: string) => {
    if (!userData) return;
    try {
      await updateUserStatus(uid, 'active');
      await logAction({
        action: 'activate_user',
        performedBy: userData.uid,
        role: 'primeadmin',
        targetId: uid,
        bypass: true,
      });
      toast.success('User activated');
    } catch {
      toast.error('Failed to activate user');
    }
  };

  const handleDelete = async (uid: string) => {
    if (!userData) return;
    if (uid === userData.uid) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (window.confirm("Are you sure you want to completely delete this user from both the database AND Firebase Authentication?")) {
      try {
        // 1. First trigger log event locally (so it records before the user is gone)
        await logAction({
          action: 'delete_user',
          performedBy: userData.uid,
          role: 'primeadmin',
          targetId: uid,
          bypass: true,
        });
        
        // 2. Call new backend API that deletes them from BOTH Auth and Firestore
        const response = await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
        
        if (!response.ok) {
          throw new Error('Failed to delete from server');
        }
        
        toast.success('User completely un-registered & deleted');
      } catch (err: any) {
        toast.error('Failed to fully delete user. ' + err.message);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    buyers: users.filter((u) => u.role === 'buyer').length,
    sellers: users.filter((u) => u.role === 'seller').length,
    managers: users.filter((u) => u.role === 'manager').length,
    super_admins: users.filter((u) => u.role === 'primeadmin').length,
    banned: users.filter((u) => u.status === 'banned').length,
  };

  const getRoleBadge = (role: UserRole) => {
    const c = getRoleColor(role);
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
        {role === 'primeadmin' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
        {getRoleDisplayName(role)}
      </span>
    );
  };

  const promotionTargets = getAllowedPromotionTargets('primeadmin');

  return (
    <div className="min-h-screen bg-[#0D0705] text-[#FFF3E0]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1A0F0B]/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[#FFF3E0] group-hover:text-purple-400 transition-colors">
                Prime <span className="text-purple-400">Admin</span>
              </h1>
              <p className="text-xs text-[#FFF3E0]/40">
                Welcome, {userData?.name || 'Prime Admin'}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-colors flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Manager Dashboard
            </button>
            
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block mx-2" />

            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center font-bold text-xs text-white shadow-lg group-hover:scale-110 transition-transform">
                {(userData?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-[#FFF3E0]/70 group-hover:text-white hidden sm:block">
                View Profile
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: stats.total, color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
            { label: 'Buyers', value: stats.buyers, color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
            { label: 'Sellers', value: stats.sellers, color: 'from-emerald-500/20 to-emerald-500/5' },
            { label: 'Managers', value: stats.managers, color: 'from-blue-500/20 to-blue-500/5' },
            { label: 'Prime Admins', value: stats.super_admins, color: 'from-purple-500/20 to-purple-500/5' },
            { label: 'Banned', value: stats.banned, color: 'from-red-500/20 to-red-500/5' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${s.color} bg-[#1A0F0B] border border-white/10 rounded-2xl p-4 text-center`}
            >
              <p className="text-2xl font-bold text-[#FFF3E0]">{s.value}</p>
              <p className="text-[10px] text-[#FFF3E0]/40 uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-400">Prime Admin Privileges</p>
            <p className="text-xs text-[#FFF3E0]/50 mt-1">
              You have full control over user roles. Only Prime Admins can promote users to Manager or Prime Admin.
              All actions are audit-logged. Use this power responsibly.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFF3E0]/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-3 bg-[#1A0F0B] border border-[#3E2723] rounded-xl text-[#FFF3E0] placeholder:text-[#FFF3E0]/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#1A0F0B] border border-[#3E2723] rounded-xl px-4 py-3 text-sm text-[#FFF3E0] focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="manager">Managers</option>
            <option value="primeadmin">Prime Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-[#1A0F0B]/80 backdrop-blur-xl border border-[#3E2723] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[#3E2723] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-[#FFF3E0]">All Users</h2>
              <p className="text-xs text-[#FFF3E0]/40 mt-1">Manage roles, permissions & audit all actions</p>
            </div>
            <span className="text-xs text-[#FFF3E0]/30">{filteredUsers.length} results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-medium text-[#FFF3E0]/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#FFF3E0]/40">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#FFF3E0]/40">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleColors = getRoleColor(u.role);
                    return (
                      <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br ${roleColors.gradient} text-white`}>
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-[#FFF3E0]">{u.name || 'Unknown'}</p>
                              <p className="text-[10px] text-[#FFF3E0]/30 font-mono">{u.uid.slice(0, 16)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#FFF3E0]/70">{u.email}</td>
                        <td className="px-5 py-4">{getRoleBadge(u.role)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {u.status === 'active' ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                                <select
                                  value={u.role}
                                  onChange={(e) => handlePromote(u.uid, e.target.value as UserRole)}
                                  className="bg-[#1A0F0B] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-purple-500/50 text-[#FFF3E0]"
                                >
                                  <option value="buyer">Buyer</option>
                                  <option value="seller">Seller</option>
                                  <option value="manager">Manager</option>
                                  {u.role === 'primeadmin' && <option value="primeadmin">Prime Admin</option>}
                                </select>
                                {u.status === 'active' ? (
                                  <button
                                    onClick={() => handleBan(u.uid)}
                                    className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1"
                                  >
                                    <Ban className="w-3 h-3" /> Ban
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivate(u.uid)}
                                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 flex items-center gap-1"
                                  >
                                    <UserCheck className="w-3 h-3" /> Activate
                                  </button>
                                )}
                                {u.uid !== userData?.uid && (
                                  <button
                                    onClick={() => handleDelete(u.uid)}
                                    title="Delete User"
                                    className="p-1.5 text-xs font-semibold bg-red-500/5 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors border border-red-500/10 hover:border-red-500/30 flex items-center gap-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
      </main>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <RouteGuard allowedRoles={['primeadmin']}>
      <SuperAdminContent />
    </RouteGuard>
  );
}
