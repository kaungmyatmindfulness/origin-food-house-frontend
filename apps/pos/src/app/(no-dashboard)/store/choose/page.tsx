'use client';

import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { loginWithStore } from '@/features/auth/services/auth.service';
import {
  selectAccessToken,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { StoreList } from '@/features/store/components/store-list';
import { StoreListSkeleton } from '@/features/store/components/store-list-skeleton';
import { getCurrentUser } from '@/features/user/services/user.service';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function ChooseStorePage() {
  const router = useRouter();

  const accessToken = useAuthStore(selectAccessToken);
  const selectedStoreId = useAuthStore((state) => state.selectedStoreId);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setSelectedStore = useAuthStore((state) => state.setSelectedStore);

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', { accessToken, selectedStoreId }],
    queryFn: () => getCurrentUser(selectedStoreId!),
    enabled: !!accessToken,
  });
  console.log('📝 -> ChooseStorePage -> user:', user);

  const chooseStoreMutation = useMutation({
    mutationFn: (storeId: string) => loginWithStore({ storeId }),
  });

  const handleStoreSelect = async (storeId: string) => {
    try {
      const res = await chooseStoreMutation.mutateAsync(storeId);

      const newAccessToken = res.data?.access_token;
      if (!newAccessToken) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      setAuth(newAccessToken);
      setSelectedStore(storeId);

      const role = user?.userStores.find((store) => store.id === storeId)?.role;

      if (role === 'CHEF') {
        router.replace(`/hub/kds`);
      } else {
        router.replace('/hub/menu');
      }
    } catch (error) {
      console.error('Error caught during handleStoreSelect:', error);
    }
  };

  const pageTitle = selectedStoreId ? 'Change Your Store' : 'Choose Your Store';
  const pageDescription = selectedStoreId
    ? 'Select a different store to manage.'
    : 'Select one of your associated stores to continue.';

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
            {pageTitle}
          </h1>
          <p className="mt-2 text-gray-600">{pageDescription}</p>
        </header>

        <AnimatePresence mode="wait">
          {isUserLoading ? (
            <StoreListSkeleton key="loading" />
          ) : userError ? (
            <div key="error" className="text-center text-red-600">
              Error loading your stores.
            </div>
          ) : (
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
