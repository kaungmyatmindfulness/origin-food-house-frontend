'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { motion } from 'motion/react';

import { login } from '@/features/auth/services/auth.service';
import { loginWithAuth0 } from '@/features/auth/services/auth0.service';
import { isAuth0Configured } from '@/lib/auth0';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCurrentUser } from '@/features/user/services/user.service';
import { ROUTES } from '@/common/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('emailValidation')),
    password: z.string().min(6, t('passwordValidation')),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

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
  const queryClient = useQueryClient();
  const t = useTranslations('auth');

  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const loginSchema = createLoginSchema(t);
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

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      toast.success(t('loginSuccess'));
      // Manually refetch user data after successful login
      await queryClient.refetchQueries({ queryKey: userQueryKey });
    },
    onError: (error) => {
      // Handle specific error cases
      if (error instanceof Error) {
        // Check if it's a 404 error (endpoint not found)
        if (
          error.message.includes('404') ||
          error.message.includes('Cannot POST')
        ) {
          toast.error(
            t('loginEndpointNotAvailable') ||
              'Login endpoint not available. Please contact support or use SSO.'
          );
        }
      }
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

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

  const isLoading =
    loginMutation.isPending ||
    isUserLoading ||
    isUserFetching ||
    isAuth0Loading;

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

        {/* Login form card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t('email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        className="border-gray-300 py-6 transition-all focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t('password')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('passwordPlaceholder')}
                        className="border-gray-300 py-6 transition-all focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full bg-gradient-to-r from-orange-600 to-red-600 py-6 text-base font-medium transition-all hover:from-orange-700 hover:to-red-700 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    {t('processing')}
                  </span>
                ) : (
                  t('loginButton')
                )}
              </Button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link
                  href="/(auth)/forgot-password"
                  className="text-gray-600 transition-colors hover:text-orange-600"
                >
                  {t('forgotPassword')}
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                >
                  {t('signUpHere')}
                </Link>
              </div>
            </form>
          </Form>

          {/* Auth0 Login Option */}
          {isAuth0Available && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    {t('orContinueWith')}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-gray-300 py-6 text-base font-medium transition-all hover:border-orange-600 hover:bg-orange-50"
                onClick={handleAuth0Login}
                disabled={isLoading}
              >
                {isAuth0Loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    {t('redirecting')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    Sign in with SSO
                  </span>
                )}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
