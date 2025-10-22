'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import { loginWithAuth0 } from '@/features/auth/services/auth0.service';
import { isAuth0Configured } from '@/lib/auth0';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCurrentUser } from '@/features/user/services/user.service';
import { Button } from '@repo/ui/components/button';
import { useQuery } from '@tanstack/react-query';

const userQueryKey = ['user', 'currentUser'];

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');

  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [isAuth0Available] = useState(isAuth0Configured());
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);

  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isError: isUserError,
  } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => getCurrentUser(),
    enabled: false, // Don't fetch on mount - we're on the login page!
    retry: false, // Don't retry on 401 errors
  });

  async function handleAuth0Login() {
    try {
      setIsAuth0Loading(true);
      await loginWithAuth0();
    } catch (error) {
      console.error('Auth0 login error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to initiate Auth0 login';
      toast.error(errorMessage);
      setIsAuth0Loading(false);
    }
  }

  useEffect(() => {
    if (!isUserLoading && !isUserFetching && user && !isUserError) {
      if (selectedStoreId) {
        if (user?.selectedStoreRole !== 'CHEF') {
          router.replace('/hub/sale');
        } else {
          router.replace('/hub/kds');
        }
      } else if (user?.userStores?.length) {
        router.replace('/store/choose');
      } else {
        router.replace('/store/create');
      }
    }
  }, [
    user,
    isUserLoading,
    isUserFetching,
    isUserError,
    router,
    selectedStoreId,
  ]);

  const isLoading = isUserLoading || isUserFetching || isAuth0Loading;

  // Show error if Auth0 is not configured
  if (!isAuth0Available) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
        <div className="rounded-2xl border border-red-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-red-800">
              Auth0 Not Configured
            </h2>
            <p className="text-sm text-gray-600">
              Please configure Auth0 environment variables to enable
              authentication.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-4 h-64 w-64 animate-pulse rounded-full bg-orange-100 opacity-30 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-red-100 opacity-30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header / Brand */}
        <header className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-4xl font-bold text-transparent">
              {t('loginTitle')}
            </h1>
            <p className="mt-2 text-gray-600">{t('loginSubtitle')}</p>
          </motion.div>
        </header>

        {/* Login card - Auth0 Only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('ssoOnlyMessage') ||
                  'This application uses Single Sign-On (SSO) for secure authentication.'}
              </p>
            </div>

            <Button
              type="button"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-6 text-base font-medium transition-all hover:from-orange-700 hover:to-red-700 hover:shadow-lg disabled:opacity-50"
              onClick={handleAuth0Login}
              disabled={isLoading}
            >
              {isAuth0Loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  {t('redirecting') || 'Redirecting...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  {t('signInWithSSO') || 'Sign in with SSO'}
                </span>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500">
              <p>
                {t('ssoSecurityNote') ||
                  'Secure authentication powered by Auth0'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
