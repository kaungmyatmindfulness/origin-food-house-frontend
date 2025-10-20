'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { motion } from 'motion/react';

import { register } from '@/features/auth/services/auth.service';
import { loginWithAuth0 } from '@/features/auth/services/auth0.service';
import { isAuth0Configured } from '@/lib/auth0';
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
import { useMutation } from '@tanstack/react-query';

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t('nameValidation')).max(100, t('nameTooLong')),
      email: z.string().email(t('emailValidation')),
      password: z.string().min(6, t('passwordValidation')),
      confirmPassword: z.string().min(6, t('passwordValidation')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-orange-500' },
      { strength: 3, label: 'Good', color: 'bg-yellow-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[strength] || levels[0];
  };

  const { strength, label, color } = getStrength(password) ?? {
    strength: 0,
    label: '',
    color: '',
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength ? color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs text-gray-600">
          Password strength: <span className="font-medium">{label}</span>
        </p>
      )}
    </div>
  );
}

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

function PasswordInput({
  field,
  placeholder,
}: {
  field: any;
  placeholder: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...field}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
      >
        {showPassword ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');

  const registerSchema = createRegisterSchema(t);
  const [isAuth0Available] = useState(isAuth0Configured());
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      if (response.status === 'success') {
        setRegistrationSuccess(true);
        toast.success(t('registerSuccess'));
        toast.info(t('checkEmailVerification'));
      }
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const passwordValue = form.watch('password');

  async function onSubmit(values: RegisterFormValues) {
    const { name, email, password } = values;
    registerMutation.mutate({ email, password, name });
  }

  async function handleAuth0Signup() {
    try {
      setIsAuth0Loading(true);
      await loginWithAuth0();
    } catch (error) {
      console.error('Auth0 signup error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to initiate Auth0 signup';
      toast.error(errorMessage);
      setIsAuth0Loading(false);
    }
  }

  const isLoading = registerMutation.isPending || isAuth0Loading;

  if (registrationSuccess) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-4 h-64 w-64 animate-pulse rounded-full bg-orange-100 opacity-30 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-red-100 opacity-30 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg"
            >
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="mb-3 text-3xl font-bold text-gray-900">
                {t('registrationComplete')}
              </h2>
              <p className="mb-2 text-gray-600">{t('checkEmailMessage')}</p>
              <p className="mb-8 text-sm text-gray-500">
                {t('verificationEmailSent')}
              </p>
              <Button
                onClick={() => router.push(ROUTES.LOGIN)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-6 text-base font-medium hover:from-orange-700 hover:to-red-700"
              >
                {t('goToLogin')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
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
        {/* Header */}
        <header className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-4xl font-bold text-transparent">
              {t('registerTitle')}
            </h1>
            <p className="mt-2 text-gray-600">{t('registerSubtitle')}</p>
          </motion.div>
        </header>

        {/* Registration form card */}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">{t('name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('namePlaceholder')}
                        className="border-gray-300 py-6 transition-all focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <PasswordInput
                        field={field}
                        placeholder={t('passwordPlaceholder')}
                      />
                    </FormControl>
                    <PasswordStrengthIndicator password={passwordValue} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t('confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        field={field}
                        placeholder={t('confirmPasswordPlaceholder')}
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
                  t('registerButton')
                )}
              </Button>

              <p className="mt-6 text-center text-sm text-gray-600">
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                >
                  {t('loginHere')}
                </Link>
              </p>
            </form>
          </Form>

          {/* Auth0 Signup Option */}
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
                onClick={handleAuth0Signup}
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
                    {t('signUpWithSSO')}
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
