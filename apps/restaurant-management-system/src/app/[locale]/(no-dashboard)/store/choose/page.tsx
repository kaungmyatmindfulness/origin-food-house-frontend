'use client';

import { AlertCircle, Plus, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from '@repo/ui/lib/toast';

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
  const [clickedStoreId, setClickedStoreId] = useState<string | null>(null);

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
    onSuccess: async (_data, storeId) => {
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
        router.replace('/hub/kitchen');
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

    setClickedStoreId(storeIdString);
    chooseStoreMutation.mutate(storeIdString);
  };

  const pageTitle = selectedStoreId ? t('changeTitle') : t('title');
  const pageDescription = selectedStoreId
    ? t('changeDescription')
    : t('description');

  if (isUserLoading) {
    return (
      <main className="from-muted/30 to-muted/50 min-h-screen bg-gradient-to-b p-4">
        <StoreListSkeleton />
      </main>
    );
  }

  if (isUserError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div
          className="text-destructive text-center"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="mx-auto mb-2 h-10 w-10" aria-hidden="true" />
          <p className="text-lg font-medium">{t('couldNotLoadSession')}</p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/">{t('goToLogin')}</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="from-muted/30 to-muted/50 min-h-screen bg-gradient-to-b p-4">
      <section
        className="bg-card mx-auto mt-10 max-w-2xl rounded-xl border p-6 shadow-md"
        role="region"
        aria-labelledby="choose-store-heading"
      >
        <header className="mb-6 text-center">
          <h1
            id="choose-store-heading"
            className="text-foreground text-2xl font-semibold"
          >
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {pageDescription}
          </p>
        </header>

        {user?.userStores && user.userStores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="my-6"
          >
            <Button
              variant="default"
              size="lg"
              className="w-full transition-all duration-200 hover:shadow-md"
              asChild
            >
              <Link href="/store/create">
                <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                {t('createNewStore')}
              </Link>
            </Button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!user?.userStores || user.userStores.length === 0 ? (
            <motion.div
              key="no-stores"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <Store className="text-muted-foreground/40 mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground">{t('noStoresFound')}</p>
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
                isLoading={chooseStoreMutation.isPending}
                selectedStoreId={clickedStoreId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-6 space-y-4">
          {selectedStoreId && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}
            >
              {t('cancel')}
            </Button>
          )}
          <p className="text-muted-foreground text-center text-xs">
            {t('selectToProceed')}
          </p>
        </footer>
      </section>
    </main>
  );
}
