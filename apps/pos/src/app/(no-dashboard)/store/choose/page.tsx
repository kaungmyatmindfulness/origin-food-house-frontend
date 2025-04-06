'use client';

import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

import { loginWithStore } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { StoreList } from '@/features/store/components/store-list';
import { StoreListSkeleton } from '@/features/store/components/store-list-skeleton';
import { getCurrentUser } from '@/features/user/services/user.service';
import { useMutation, useQuery } from '@tanstack/react-query';

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
        router.push('/hub/sale');
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
      const accessToken = res.data?.access_token;
      if (!accessToken) {
        toast.error('Failed to select store. Please try again.');
        return;
      }
      setAuth(accessToken);
      if (user?.currentRole !== 'CHEF') {
        router.push('/hub/sale');
      } else {
        router.push('/hub/kds');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen p-4">
      <section
        className="max-w-3xl p-8 mx-auto rounded-lg shadow-lg"
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

        <footer className="mt-8 text-sm text-center text-gray-500">
          <p>Need help? Contact support.</p>
        </footer>
      </section>
    </main>
  );
}
