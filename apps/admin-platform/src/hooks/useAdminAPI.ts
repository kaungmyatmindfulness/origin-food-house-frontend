'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/adminAPI';
import { useAuth } from './useAuth';
import type {
  ListStoresQuery,
  ListUsersQuery,
  GetPaymentQueueQuery,
} from '@/services/adminAPI';

export const adminKeys = {
  all: ['admin'] as const,
  stores: () => [...adminKeys.all, 'stores'] as const,
  storesList: (query: ListStoresQuery) =>
    [...adminKeys.stores(), 'list', query] as const,
  storeDetail: (id: string) => [...adminKeys.stores(), 'detail', id] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (query: ListUsersQuery) =>
    [...adminKeys.users(), 'list', query] as const,
  userDetail: (id: string) => [...adminKeys.users(), 'detail', id] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  paymentQueue: (query: GetPaymentQueueQuery) =>
    [...adminKeys.payments(), 'queue', query] as const,
  paymentDetail: (id: string) =>
    [...adminKeys.payments(), 'detail', id] as const,
};

export function useStores(query: ListStoresQuery = {}) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery({
    queryKey: adminKeys.storesList(query),
    queryFn: async () => {
      await getAccessTokenSilently();
      return adminAPI.listStores(query);
    },
  });
}

export function useStoreDetail(storeId: string) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery({
    queryKey: adminKeys.storeDetail(storeId),
    queryFn: async () => {
      await getAccessTokenSilently();
      return adminAPI.getStoreDetail(storeId);
    },
    enabled: !!storeId,
  });
}

export function useUsers(query: ListUsersQuery = {}) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery({
    queryKey: adminKeys.usersList(query),
    queryFn: async () => {
      await getAccessTokenSilently();
      return adminAPI.listUsers(query);
    },
  });
}

export function useUserDetail(userId: string) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery({
    queryKey: adminKeys.userDetail(userId),
    queryFn: async () => {
      await getAccessTokenSilently();
      return adminAPI.getUserDetail(userId);
    },
    enabled: !!userId,
  });
}

export function usePaymentQueue(query: GetPaymentQueueQuery = {}) {
  const { getAccessTokenSilently } = useAuth();

  return useQuery({
    queryKey: adminKeys.paymentQueue(query),
    queryFn: async () => {
      await getAccessTokenSilently();
      return adminAPI.getPaymentQueue(query);
    },
  });
}

export function useSuspendStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      adminAPI.suspendStore(storeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stores() });
    },
  });
}

export function useBanStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      adminAPI.banStore(storeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stores() });
    },
  });
}

export function useReactivateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => adminAPI.reactivateStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stores() });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => adminAPI.verifyPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.payments() });
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      reason,
    }: {
      paymentId: string;
      reason: string;
    }) => adminAPI.rejectPayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.payments() });
    },
  });
}
