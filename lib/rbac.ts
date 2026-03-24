/**
 * RBAC (Role-Based Access Control) Module
 * Centralized permission checks for all roles in the Chocket system.
 *
 * Role Hierarchy (highest to lowest):
 *   1. super_admin  — unrestricted; bypasses all moderation
 *   2. manager      — operational; moderation queue, order management
 *   3. seller       — product creation (moderated), own orders
 *   4. buyer        — browse, order, review
 */

import type { UserRole } from '@/types';

// ===== ROLE HIERARCHY =====
const ROLE_LEVELS: Record<UserRole, number> = {
  buyer: 0,
  seller: 1,
  manager: 2,
  primeadmin: 3,
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVELS[role] ?? 0;
}

// ===== IDENTITY CHECKS =====
export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

export function isManager(role: UserRole | null | undefined): boolean {
  return role === 'manager';
}

export function isSeller(role: UserRole | null | undefined): boolean {
  return role === 'seller';
}

export function isBuyer(role: UserRole | null | undefined): boolean {
  return role === 'buyer';
}

// ===== ACCESS CONTROL =====

/** Super Admin has unrestricted access to everything */
export function canAccessSuperAdminDashboard(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Manager dashboard access: managers + super_admin */
export function canAccessManagerDashboard(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

/** Seller dashboard access: sellers + managers + super_admin */
export function canAccessSellerDashboard(role: UserRole | null | undefined): boolean {
  return role === 'seller' || role === 'manager' || role === 'primeadmin';
}

// ===== PRODUCT PERMISSIONS =====

/** Can create products (sellers create versioned, super_admin creates live) */
export function canCreateProduct(role: UserRole | null | undefined): boolean {
  return role === 'seller' || role === 'manager' || role === 'primeadmin';
}

/** Can bypass moderation (only super_admin) */
export function canBypassModeration(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Can moderate products (approve/reject) */
export function canModerateProducts(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

/** Can delete products */
export function canDeleteProduct(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

// ===== ORDER PERMISSIONS =====

/** Can view all orders (not just own) */
export function canViewAllOrders(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

/** Seller can update own order status (processing → shipped → delivered) */
export function canUpdateOwnOrderStatus(role: UserRole | null | undefined): boolean {
  return role === 'seller' || role === 'manager' || role === 'primeadmin';
}

/** Can cancel / refund orders */
export function canCancelRefundOrders(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

/** Full order control */
export function canManageOrders(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

// ===== USER MANAGEMENT =====

/** Can create/manage sellers (managers can; NOT other managers) */
export function canManageSellers(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

/** Can create/manage managers */
export function canManageManagers(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Can manage ALL users (ban/activate/delete) */
export function canManageAllUsers(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Allowed roles a given role can promote to */
export function getAllowedPromotionTargets(role: UserRole | null | undefined): UserRole[] {
  if (role === 'primeadmin') return ['buyer', 'seller', 'manager', 'primeadmin'];
  if (role === 'manager') return ['buyer', 'seller'];
  return [];
}

// ===== PAYOUT PERMISSIONS =====

/** Only super_admin can approve payouts */
export function canApprovePayouts(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Sellers can request payouts */
export function canRequestPayout(role: UserRole | null | undefined): boolean {
  return role === 'seller';
}

// ===== SYSTEM SETTINGS =====

/** Can access system-level settings / financial controls */
export function canAccessSystemSettings(role: UserRole | null | undefined): boolean {
  return role === 'primeadmin';
}

/** Can manage categories, discounts, banners */
export function canManageCatalog(role: UserRole | null | undefined): boolean {
  return role === 'manager' || role === 'primeadmin';
}

// ===== DASHBOARD PATH =====
export function getDashboardPath(role: UserRole | null | undefined): string {
  switch (role) {
    case 'primeadmin':
      return '/superadmin/dashboard';
    case 'manager':
      return '/admin';
    case 'seller':
      return '/seller/dashboard';
    case 'buyer':
    default:
      return '/profile';
  }
}

// ===== DISPLAY HELPERS =====
export function getRoleDisplayName(role: UserRole | null | undefined): string {
  switch (role) {
    case 'primeadmin':
      return 'Prime Admin';
    case 'manager':
      return 'Manager';
    case 'seller':
      return 'Seller';
    case 'buyer':
    default:
      return 'Buyer';
  }
}

export function getRoleColor(role: UserRole | null | undefined): {
  bg: string;
  text: string;
  border: string;
  gradient: string;
} {
  switch (role) {
    case 'primeadmin':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        gradient: 'from-purple-500 to-purple-700',
      };
    case 'manager':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
        gradient: 'from-blue-500 to-blue-700',
      };
    case 'seller':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500 to-emerald-700',
      };
    case 'buyer':
    default:
      return {
        bg: 'bg-[#D4AF37]/10',
        text: 'text-[#D4AF37]',
        border: 'border-[#D4AF37]/20',
        gradient: 'from-[#D4AF37] to-[#B8860B]',
      };
  }
}
