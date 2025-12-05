/**
 * RMS API Client Configuration
 *
 * Sets up the API client with authentication handling for the RMS app.
 * Uses openapi-fetch for type-safe API calls and openapi-react-query for React Query integration.
 */

import { QueryClient } from '@tanstack/react-query';

import {
  createApiClient,
  createApiQueryClient,
  createAuthMiddleware,
  errorToastMiddleware,
} from '@repo/api';

import { useAuthStore } from '@/features/auth/store/auth.store';

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
 * export async function getStoreDetails(id: string): Promise<GetStoreDetailsResponseDto> {
 *   const result = await apiClient.GET('/stores/{id}', { params: { path: { id } } });
 *   return unwrapApiResponseAs<GetStoreDetailsResponseDto>(result, 'Failed to fetch store');
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
 *
 * const { data, isLoading } = $api.useQuery('get', '/stores/{storeId}/categories', {
 *   params: { path: { storeId } }
 * });
 *
 * const mutation = $api.useMutation('post', '/stores/{storeId}/categories');
 * mutation.mutate({ params: { path: { storeId } }, body: { name: 'New Category' } });
 * ```
 */
export const $api = createApiQueryClient(apiClient);

/**
 * Creates QueryClient with offline-first configuration for RMS.
 *
 * This is centralized here to ensure both the QueryClientProvider and $api hooks
 * use the same configuration. The client is created as a singleton for the browser.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
        retry: (failureCount) => {
          return (
            typeof navigator !== 'undefined' &&
            navigator.onLine &&
            failureCount < 2
          );
        },
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 0,

        networkMode: 'offlineFirst',
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
