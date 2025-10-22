'use client';

import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { loginWithStoreAuth0 } from '@/features/auth/services/auth0.service';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { StoreList } from '@/features/store/components/store-list';
import { StoreListSkeleton } from '@/features/store/components/store-list-skeleton';
import { getCurrentUser } from '@/features/user/services/user.service';
import { Button } from '@repo/ui/components/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CurrentUserData } from '@/features/user/types/user.types';
const currentUserQueryKey = (storeId?: string | null) => [
  'currentUser',
  { storeId: storeId ?? 'context-free' },
];

export default function ChooseStorePage() {
  const t = useTranslations('store.choose');
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
        toast.info(t('noStoresYet'));
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
    t,
  ]);

  const chooseStoreMutation = useMutation({
    mutationFn: (storeId: string) => loginWithStoreAuth0({ storeId }),
    onSuccess: async (data, storeId) => {
      toast.success(t('storeSelectedSuccess'));

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
        toast.error(t('sessionRefreshFailed'));
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
      toast.error(t('invalidStore'));
      return;
    }

    chooseStoreMutation.mutate(storeIdString);
  };

  const pageTitle = selectedStoreId ? t('changeTitle') : t('title');
  const pageDescription = selectedStoreId
    ? t('changeDescription')
    : t('description');

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
          {t('couldNotLoadSession')}
          <div className="mt-4">
            <Button onClick={() => router.push('/login')} variant="outline">
              {t('goToLogin')}
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
              {t('noStoresFound')}
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
          <p>{t('selectToProceed')}</p>
        </footer>
      </section>
    </main>
  );
}
