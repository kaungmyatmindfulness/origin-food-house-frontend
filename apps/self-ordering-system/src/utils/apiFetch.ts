/**
 * SOS API Client Configuration
 *
 * Sets up the API client for the Self-Ordering System app.
 * SOS doesn't use user authentication - guests use session tokens instead.
 */

import {
  createApiClient,
  createApiQueryClient,
  errorToastMiddleware,
} from '@repo/api';

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
 * Type-safe fetch client for the SOS API.
 * No auth middleware - SOS uses session tokens, not user auth.
 *
 * @example
 * ```ts
 * const { data, error } = await apiClient.GET('/stores/{slug}/menu', {
 *   params: { path: { slug: 'restaurant-slug' } }
 * });
 * ```
 */
export const apiClient = createApiClient({
  baseUrl: baseUrl ?? '',
  middleware: [errorToastMiddleware()],
});

/**
 * React Query wrapper for type-safe queries and mutations.
 *
 * @example
 * ```ts
 * // In a component:
 * const { data, isLoading } = $api.useQuery('get', '/stores/{slug}/menu', {
 *   params: { path: { slug } }
 * });
 * ```
 */
export const $api = createApiQueryClient(apiClient);
