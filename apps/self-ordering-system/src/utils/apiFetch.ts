/**
 * SOS API Client Configuration
 *
 * Configured for session-token based authentication for customer ordering.
 * Uses openapi-fetch for type-safe API calls and openapi-react-query for React Query integration.
 *
 * Key differences from RMS:
 * - No auth middleware (guests don't authenticate via JWT)
 * - Uses session tokens for cart/order association
 * - Simpler error handling (no auth state to clear)
 */

import { QueryClient } from '@tanstack/react-query';

import {
  createApiClient,
  createApiQueryClient,
  errorToastMiddleware,
} from '@repo/api';

// Re-export utilities for use in service files
export {
  FetchError,
  NetworkError,
  ApiError,
  UnauthorizedError,
  isApiError,
  isUnauthorizedError,
  isNetworkError,
  extractData,
  handleApiResponse,
  unwrapApiResponse,
} from '@repo/api/utils/apiFetch';

export type {
  StandardApiResponse,
  WrappedApiResponse,
  ExtractDataType,
} from '@repo/api/utils/apiFetch';

import { ApiError } from '@repo/api/utils/apiFetch';

/**
 * Type-safe API response unwrapper with explicit output type.
 *
 * Use this when the return type differs from the OpenAPI-generated types
 * (e.g., due to the Record<string, never> bug or missing fields in the spec).
 *
 * The cast through unknown is encapsulated here to keep service code clean.
 *
 * @param result - The full result from openapi-fetch { data, error, response }
 * @param errorMessage - Error message to throw on failure
 * @returns The unwrapped data payload cast to type T
 * @throws {ApiError} If there's an error or data is missing
 *
 * @example
 * ```typescript
 * export async function getMenuItems(slug: string): Promise<MenuItemResponseDto[]> {
 *   const result = await apiClient.GET('/api/v1/stores/{slug}/menu-items', { params: { path: { slug } } });
 *   return unwrapApiResponseAs<MenuItemResponseDto[]>(result, 'Failed to fetch menu');
 * }
 * ```
 */
export function unwrapApiResponseAs<T>(
  result: {
    data?: unknown;
    error?: unknown;
    response: Response;
  },
  errorMessage: string
): T {
  const { data, error, response } = result;

  if (error) {
    throw new ApiError(errorMessage, response.status);
  }

  if (!data) {
    throw new ApiError(errorMessage, response.status);
  }

  const wrappedData = data as {
    status?: string;
    data?: unknown;
    message?: unknown;
  };

  if (wrappedData.status === 'error') {
    const message =
      typeof wrappedData.message === 'string'
        ? wrappedData.message
        : errorMessage;
    throw new ApiError(message, response.status);
  }

  const innerData = wrappedData.data;

  if (innerData === null || innerData === undefined) {
    const message =
      typeof wrappedData.message === 'string'
        ? wrappedData.message
        : errorMessage;
    throw new ApiError(message, response.status);
  }

  return innerData as T;
}

const baseUrl = process.env['NEXT_PUBLIC_API_URL'];

if (!baseUrl) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

/**
 * Type-safe fetch client for the SOS API.
 *
 * Includes X-App-Context header to identify requests from the SOS app,
 * enabling app-specific routing on the backend (e.g., /api/v1/sos/* routes).
 *
 * @example
 * ```ts
 * const { data, error } = await apiClient.GET('/api/v1/stores/{slug}/menu-items', {
 *   params: { path: { slug } }
 * });
 * ```
 */
export const apiClient = createApiClient({
  baseUrl: baseUrl ?? '',
  headers: {
    'X-App-Context': 'sos',
  },
  middleware: [errorToastMiddleware()],
});

/**
 * React Query wrapper for type-safe queries and mutations.
 *
 * @example
 * ```ts
 * const { data, isLoading } = $api.useQuery('get', '/api/v1/stores/{slug}/menu-items', {
 *   params: { path: { slug } }
 * });
 *
 * const mutation = $api.useMutation('post', '/cart/items');
 * mutation.mutate({ body: { menuItemId, quantity } });
 * ```
 */
export const $api = createApiQueryClient(apiClient);

/**
 * Creates QueryClient with SSR-friendly configuration for SOS.
 *
 * Configured for:
 * - SSR compatibility (fresh client on server)
 * - Customer-facing UX (shorter stale times for fresh menu data)
 * - Mobile performance (conservative retry strategy)
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns the singleton QueryClient instance.
 * Creates a new instance on the server (for SSR isolation).
 * Reuses the same instance in the browser.
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
