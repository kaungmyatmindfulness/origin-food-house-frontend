/**
 * Admin Platform API Client Configuration
 *
 * Uses Auth0 for authentication with platform admin permissions.
 * Configured for SSR with type-safe API calls via openapi-fetch.
 *
 * Key differences from RMS/SOS:
 * - Auth0 React SDK for authentication (not cookie-based)
 * - Bearer token authentication (injected per-request)
 * - Platform admin context for privileged operations
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
 * export async function getStores(): Promise<StoreResponseDto[]> {
 *   const result = await apiClient.GET('/api/v1/admin/stores');
 *   return unwrapApiResponseAs<StoreResponseDto[]>(result, 'Failed to fetch stores');
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
 * Type-safe fetch client for the Admin API.
 *
 * Includes X-App-Context header to identify requests from the Admin Platform,
 * enabling app-specific routing on the backend (e.g., /api/v1/admin/* routes).
 *
 * Note: Auth0 bearer tokens should be added per-request using middleware or
 * by creating authenticated fetch functions that inject the token.
 *
 * @example
 * ```ts
 * // For authenticated requests, add the token in the request:
 * const token = await getAccessTokenSilently();
 * const { data, error } = await apiClient.GET('/api/v1/admin/stores', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * ```
 */
export const apiClient = createApiClient({
  baseUrl: baseUrl ?? '',
  headers: {
    'X-App-Context': 'admin',
  },
  middleware: [errorToastMiddleware()],
});

/**
 * React Query wrapper for type-safe queries and mutations.
 *
 * For authenticated operations, use with Auth0's getAccessTokenSilently:
 *
 * @example
 * ```ts
 * // In a component with Auth0:
 * const { getAccessTokenSilently } = useAuth0();
 *
 * const { data, isLoading } = useQuery({
 *   queryKey: ['admin', 'stores'],
 *   queryFn: async () => {
 *     const token = await getAccessTokenSilently();
 *     const result = await apiClient.GET('/api/v1/admin/stores', {
 *       headers: { Authorization: `Bearer ${token}` }
 *     });
 *     return unwrapApiResponseAs<StoreResponseDto[]>(result, 'Failed to fetch stores');
 *   }
 * });
 * ```
 */
export const $api = createApiQueryClient(apiClient);

/**
 * Creates QueryClient with SSR-friendly configuration for Admin Platform.
 *
 * Configured for:
 * - SSR compatibility (fresh client on server)
 * - Admin dashboard UX (moderate stale times)
 * - Reliable data fetching (conservative retry strategy)
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
