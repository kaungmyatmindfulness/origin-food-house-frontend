'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@repo/ui/lib/toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  useAuthStore,
  selectSelectedStoreId,
  selectIsAuthenticated,
} from '@/features/auth/store/auth.store';
import { getCurrentUser } from '@/features/user/services/user.service';
import type { CurrentUserData } from '@/features/user/types/user.types';

import { ApiError, UnauthorizedError } from '@/utils/apiFetch';
import { ROUTES, ERROR_MESSAGES } from '@/common/constants/routes';

interface UseProtectedOptions {
  /** Optional array of role strings/enums. If provided, user role will be checked against this list. */
  allowedRoles?: string[];
  /** Path to redirect to if not authenticated (query fails with 401/no user). Defaults to '/login'. */
  loginRedirectTo?: string;
  /** Path to redirect to if authenticated but role is not allowed OR if API returns 403. Defaults to '/store/choose'. */
  unauthorizedRedirectTo?: string;
  /** Optional callback triggered just before redirection. */
  onRedirect?: () => void;
}

interface UseProtectedReturn {
  /** True during the initial mount and data fetch. Component should show loading UI. */
  isLoading: boolean;
  /** True once the initial mount and data fetch have completed (successfully or with an error). */
  isFinished: boolean;
}

/**
 * Simplified hook to ensure user is authenticated and optionally authorized for a page/component.
 * Relies on the underlying `apiFetch` to handle 401 state update & throw errors.
 * Catches errors from the user query and performs appropriate redirects or throws authz errors.
 *
 * @param options - Configuration options: allowedRoles, loginRedirectTo, unauthorizedRedirectTo, onAuthorizationFail.
 * @returns {object} { isLoading: boolean; isFinished: boolean; }
 */
export function useProtected(
  options?: UseProtectedOptions
): UseProtectedReturn {
  const {
    allowedRoles,
    loginRedirectTo = ROUTES.LOGIN,
    unauthorizedRedirectTo = ROUTES.STORE_CHOOSE,
    onRedirect,
  } = options ?? {};

  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const [isMounted, setIsMounted] = useState(false);

  const needsRoleCheck = Array.isArray(allowedRoles) && allowedRoles.length > 0;

  const queryKey = [
    'currentUser',
    'protectedCheck',
    { storeId: needsRoleCheck ? selectedStoreId : 'none' },
  ];

  const {
    data: user,
    isLoading: isUserQueryLoading,
    isError: isUserQueryError,
    error: userQueryError,
    isSuccess: isUserQuerySuccess,
  } = useQuery<CurrentUserData | null, Error>({
    queryKey: queryKey,
    queryFn: async () => {
      if (needsRoleCheck && !selectedStoreId) {
        throw new Error(ERROR_MESSAGES.STORE.REQUIRED_FOR_ROLE_CHECK);
      }
      return getCurrentUser(
        needsRoleCheck ? selectedStoreId || undefined : undefined
      );
    },
    enabled: isMounted,
  });

  const isLoading = !isMounted || isUserQueryLoading;
  const isFinished = isMounted && !isUserQueryLoading;

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    if (isUserQueryError) {
      console.error('useProtected: User query failed.', userQueryError);
      onRedirect?.();

      if (userQueryError instanceof UnauthorizedError) {
        useAuthStore.getState().setAuthenticated(false);
        queryClient.clear();
        router.replace(loginRedirectTo);
      } else if (
        userQueryError instanceof ApiError &&
        userQueryError.status === 403
      ) {
        toast.error(ERROR_MESSAGES.AUTH.PERMISSION_DENIED);
        router.replace(unauthorizedRedirectTo);
      } else if (
        userQueryError.message === ERROR_MESSAGES.STORE.REQUIRED_FOR_ROLE_CHECK
      ) {
        toast.warning(ERROR_MESSAGES.AUTH.STORE_REQUIRED);
        router.replace(ROUTES.STORE_CHOOSE);
      } else {
        router.replace(loginRedirectTo);
      }
      return;
    }

    if (isUserQuerySuccess) {
      if (!user) {
        console.error(
          'useProtected: Query succeeded but user data is null/undefined.'
        );
        toast.error(ERROR_MESSAGES.AUTH.INVALID_SESSION);
        onRedirect?.();

        useAuthStore.getState().setAuthenticated(false);
        queryClient.clear();
        router.replace(loginRedirectTo);
        return;
      }

      useAuthStore.getState().setAuthenticated(true);

      if (needsRoleCheck) {
        const userRole = user?.selectedStoreRole;

        if (!userRole) {
          console.error(
            'useProtected: Role check needed, but user role is missing.'
          );
          toast.error(ERROR_MESSAGES.AUTH.ROLE_MISSING);
          onRedirect?.();

          router.replace(unauthorizedRedirectTo);
        } else if (!allowedRoles!.includes(userRole)) {
          console.warn(
            `useProtected: Role mismatch (User: ${userRole}, Allowed: ${allowedRoles!.join(',')})`
          );
          toast.error(ERROR_MESSAGES.AUTH.NO_PERMISSION);
          onRedirect?.();

          router.replace(unauthorizedRedirectTo);
        }
      }
    }
  }, [
    isFinished,
    isUserQueryError,
    isUserQuerySuccess,
    user,
    userQueryError,
    needsRoleCheck,
    allowedRoles,
    selectedStoreId,
    onRedirect,
    router,
    queryClient,
    loginRedirectTo,
    unauthorizedRedirectTo,
  ]);

  useEffect(() => {
    if (isMounted && isFinished && !isAuthenticated) {
      queryClient.clear();
      router.replace(loginRedirectTo);
    }
  }, [isMounted, isFinished, isAuthenticated, loginRedirectTo, queryClient, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return { isLoading, isFinished };
}
