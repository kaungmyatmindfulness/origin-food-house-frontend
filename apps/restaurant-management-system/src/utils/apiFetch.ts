/**
 * RMS API Client Configuration
 *
 * Sets up the API client with authentication handling for the RMS app.
 * Uses openapi-fetch for type-safe API calls and openapi-react-query for React Query integration.
 */

import {
  createApiClient,
  createApiQueryClient,
  createAuthMiddleware,
  errorToastMiddleware,
} from '@repo/api';

import { useAuthStore } from '@/features/auth/store/auth.store';

// Re-export error utilities
export {
  FetchError,
  NetworkError,
  ApiError,
  UnauthorizedError,
  isApiError,
  isUnauthorizedError,
  isNetworkError,
} from '@repo/api/utils/apiFetch';

export type { StandardApiResponse } from '@repo/api/types/api.types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

/**
 * Auth middleware that clears auth state on 401 responses
 */
const authMiddleware = createAuthMiddleware(() => {
  try {
    useAuthStore.getState().clearAuth();
  } catch (error) {
    console.error('Failed to clear auth on 401:', error);
  }
});

/**
 * Type-safe fetch client for the RMS API.
 *
 * @example
 * ```ts
 * const { data, error } = await apiClient.GET('/stores/{storeId}/categories', {
 *   params: { path: { storeId } }
 * });
 * ```
 */
export const apiClient = createApiClient({
  baseUrl: baseUrl ?? '',
  middleware: [authMiddleware, errorToastMiddleware()],
});

/**
 * React Query wrapper for type-safe queries and mutations.
 *
 * @example
 * ```ts
 * // In a component:
 * const { data, isLoading } = $api.useQuery('get', '/stores/{storeId}/categories', {
 *   params: { path: { storeId } }
 * });
 *
 * const mutation = $api.useMutation('post', '/stores/{storeId}/categories');
 * mutation.mutate({ params: { path: { storeId } }, body: { name: 'New Category' } });
 * ```
 */
export const $api = createApiQueryClient(apiClient);
