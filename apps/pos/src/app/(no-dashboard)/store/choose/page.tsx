'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';

import { loginWithStore } from '@/features/auth/services/auth.service';

import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import { StoreList } from '@/features/store/components/store-list';
import { StoreListSkeleton } from '@/features/store/components/store-list-skeleton';
import { getCurrentUser } from '@/features/user/services/user.service';
import type { CurrentUserData } from '@/features/user/types/user.types';
import { Button } from '@repo/ui/components/button';
import type { ApiError, UnauthorizedError } from '@/utils/apiFetch';

const currentUserQueryKey = (storeId?: string | null) => [
  'currentUser',
  { storeId: storeId ?? 'context-free' },
];

export default function ChooseStorePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const setSelectedStore = useAuthStore((state) => state.setSelectedStore);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    isSuccess: isUserSuccess,
  } = useQuery({
    queryKey: currentUserQueryKey(),
    queryFn: () => getCurrentUser(selectedStoreId || undefined),
    retry: 1,
  });

  useEffect(() => {
    if (isUserLoading) return;

    if (isUserSuccess) {
      if (user && (!user.userStores || user.userStores.length === 0)) {
        toast.info("You don't have any stores yet. Let's create one!");
        router.replace('/store/create');
        return;
      }

      if (selectedStoreId && user?.selectedStoreRole) {
        console.log('ChooseStorePage: Store already selected, redirecting...');

        if (user.selectedStoreRole !== 'CHEF') {
          router.replace('/hub/menu');
        } else {
          router.replace('/hub/kds');
        }
        return;
      }
    }
  }, [
    user,
    isUserLoading,
    isUserError,
    isUserSuccess,
    userError,
    selectedStoreId,
    router,
  ]);

  const chooseStoreMutation = useMutation({
    mutationFn: (storeId: string) => loginWithStore({ storeId }),
    onSuccess: async (data, storeId) => {
      toast.success(data?.message || 'Store selected successfully!');

      setSelectedStore(storeId);

      let updatedUser: CurrentUserData | null = null;
      try {
        updatedUser = await queryClient.fetchQuery<
          CurrentUserData | null,
          Error
        >({
          queryKey: currentUserQueryKey(storeId),
          queryFn: () => getCurrentUser(storeId),
          staleTime: 0,
        });
      } catch {
        toast.error('Session updated, but failed to refresh user context.');
      }

      const role = updatedUser?.selectedStoreRole;

      if (role === 'CHEF') {
        router.replace(`/hub/kds`);
      } else {
        router.replace('/hub/menu');
      }
    },
  });

  const handleStoreSelect = (storeId: string | number) => {
    const storeIdString = String(storeId);
    if (!storeIdString) {
      toast.error('Invalid store selected.');
      return;
    }

    chooseStoreMutation.mutate(storeIdString);
  };

  const pageTitle = selectedStoreId ? 'Change Your Store' : 'Choose Your Store';
  const pageDescription = selectedStoreId
    ? 'Select a different store to manage.'
    : 'Select one of your associated stores to continue.';

  if (isUserLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <StoreListSkeleton />
        </div>
      </main>
    );
  }

  if (isUserError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertCircle className="mx-auto mb-2 h-10 w-10" />
          Could not load user session.
          <div className="mt-4">
            <Button onClick={() => router.push('/login')} variant="outline">
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <section
        className="mx-auto mt-10 max-w-2xl rounded-xl bg-white p-6 shadow-md dark:bg-gray-800/50"
        aria-labelledby="choose-store-heading"
      >
        <header className="mb-6 text-center">
          <h1
            id="choose-store-heading"
            className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
          >
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pageDescription}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!user?.userStores || user.userStores.length === 0 ? (
            <motion.div
              key="no-stores"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center text-gray-500 dark:text-gray-400"
            >
              No stores found for your account.
            </motion.div>
          ) : (
            <motion.div
              key="stores"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StoreList
                userStores={user.userStores}
                onSelect={handleStoreSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Select a store to proceed.</p>
        </footer>
      </section>
    </main>
  );
}
