'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';

import { getCurrentUser } from '@/features/user/services/user.service';
import { loginWithStore } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { StoreListSkeleton } from '@/features/store/components/store-list-skeleton';
import { StoreList } from '@/features/store/components/store-list';

export default function ChooseStorePage() {
  const router = useRouter();
  const { accessToken, setAuth } = useAuthStore();

  // Query to fetch user data
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => getCurrentUser(),
    enabled: !!accessToken,
  });

  // Mutation to choose store
  const chooseStoreMutation = useMutation({
    mutationFn: (storeId: number) => loginWithStore({ storeId }),
    // onSuccess: (res) => {
    //   setAuth(res.data.access_token);
    // },
  });

  // After fetching user, decide route
  useEffect(() => {
    if (!accessToken) return;
    if (isUserLoading) return;
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }
    // If store is chosen, redirect
    if (user?.currentStore) {
      if (user.currentRole !== 'CHEF') {
        router.push('/hub/sales');
      } else {
        router.push('/hub/kds');
      }
    }
    // If no stores, go create store
    else if (!user?.userStores || user.userStores.length === 0) {
      router.push('/store/create');
    }
  }, [accessToken, isUserLoading, user, userError, router]);

  const handleStoreSelect = async (storeId: number) => {
    try {
      const res = await chooseStoreMutation.mutateAsync(storeId);
      setAuth(res.data.access_token);
      if (user?.currentRole !== 'CHEF') {
        router.push('/hub/sales');
      } else {
        router.push('/hub/kds');
      }
    } catch (error) {
      console.error('Error selecting store:', error);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <section
        className="mx-auto max-w-3xl rounded-lg p-8 shadow-lg"
        aria-labelledby="choose-store-heading"
      >
        <header className="mb-8 text-center">
          <h1
            id="choose-store-heading"
            className="text-3xl font-bold text-gray-800"
          >
            Choose Your Store
          </h1>
          <p className="mt-2 text-gray-600">
            Select one of your stores to continue.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {isUserLoading ? (
            // Skeleton
            <StoreListSkeleton key="loading" />
          ) : userError ? (
            <div key="error" className="text-center text-red-600">
              Error loading your stores.
            </div>
          ) : (
            // Render final store list
            <StoreList
              key="stores"
              userStores={user?.userStores || []}
              onSelect={handleStoreSelect}
            />
          )}
        </AnimatePresence>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact support.</p>
        </footer>
      </section>
    </main>
  );
}
