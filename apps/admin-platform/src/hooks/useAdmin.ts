'use client';

import { useAuth } from './useAuth';
import { useAdminStore } from '@/stores/auth.store';

export function useAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { adminProfile, permissions } = useAdminStore();

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    adminProfile,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
