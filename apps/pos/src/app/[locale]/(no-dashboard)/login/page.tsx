'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { login } from '@/features/auth/services/auth.service';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCurrentUser } from '@/features/user/services/user.service';
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const userQueryKey = ['user', 'currentUser'];

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isError: isUserError,
  } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => getCurrentUser(),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success('Login successful!');
      queryClient.invalidateQueries({ queryKey: userQueryKey });
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
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

  const isLoading = loginMutation.isPending || isUserLoading || isUserFetching;

  return (
    <main className="flex min-h-[calc(100dvh-160px)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand */}
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Origin Food House POS
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Please sign in to continue
          </p>
        </header>

        {/* Login form card */}
        <div className="rounded bg-white p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* FormFields remain the same */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full"
              >
                {isLoading ? 'Processing...' : 'Login'}
              </Button>

              <p className="mt-4 text-center text-sm text-gray-600">
                Forgot your password?{' '}
                <Link
                  href="/(auth)/forgot-password"
                  className="font-medium text-indigo-700 hover:underline"
                >
                  Reset here
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
