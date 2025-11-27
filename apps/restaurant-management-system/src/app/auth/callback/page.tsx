'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@repo/ui/lib/toast';
import { useQueryClient } from '@tanstack/react-query';

import { handleAuth0Callback } from '@/features/auth/services/auth0.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ROUTES } from '@/common/constants/routes';

/**
 * Auth0 Callback Page
 *
 * Handles the OAuth callback from Auth0 and exchanges the Auth0 token
 * for a backend JWT token.
 */
export default function Auth0CallbackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Handle Auth0 callback and exchange token with backend
        // Returns AccessTokenData directly (accessToken, userId, email)
        const tokenData = await handleAuth0Callback();

        if (tokenData.accessToken) {
          // Mark as authenticated in the store
          useAuthStore.getState().setAuthenticated(true);

          // Clear any stale query cache
          queryClient.clear();

          // Show success message
          toast.success('Successfully authenticated! Redirecting...');

          // Redirect to store selection page
          setTimeout(() => {
            router.replace(ROUTES.STORE_CHOOSE);
          }, 500);
        } else {
          throw new Error('Authentication failed - no access token received');
        }
      } catch (err) {
        console.error('Auth0 callback error:', err);

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to complete authentication';
        setError(errorMessage);
        toast.error(errorMessage);

        // Clear any partial auth state
        useAuthStore.getState().clearAuth();

        // Redirect to login after a delay
        setTimeout(() => {
          router.replace(ROUTES.LOGIN);
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [router, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 text-center">
        {isProcessing && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Completing authentication...
            </h2>
            <p className="text-sm text-gray-500">
              Please wait while we set up your session.
            </p>
          </>
        )}

        {error && !isProcessing && (
          <>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <svg
                className="text-destructive h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-destructive text-xl font-semibold">
              Authentication Failed
            </h2>
            <p className="text-foreground text-sm">{error}</p>
            <p className="text-muted-foreground text-xs">
              Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
