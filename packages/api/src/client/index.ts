/**
 * API Client Setup
 *
 * This module provides type-safe API clients using openapi-fetch and openapi-react-query.
 *
 * Usage:
 * 1. Import and configure the client in your app's providers:
 *    ```ts
 *    import { createApiClient, createApiQueryClient } from '@repo/api/client';
 *
 *    const fetchClient = createApiClient({
 *      baseUrl: process.env.NEXT_PUBLIC_API_URL!,
 *    });
 *
 *    const $api = createApiQueryClient(fetchClient);
 *    ```
 *
 * 2. Use in components:
 *    ```ts
 *    const { data } = $api.useQuery('get', '/stores/{storeId}/categories', {
 *      params: { path: { storeId } }
 *    });
 *    ```
 */

import createFetchClient, { type Middleware } from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';

import type { paths } from '../generated/api';

export type { paths };
export type { components } from '../generated/api';

/**
 * Configuration options for the API client
 */
export interface ApiClientConfig {
  /** Base URL for the API (e.g., 'https://api.example.com') */
  baseUrl: string;
  /** Additional headers to include with every request */
  headers?: Record<string, string>;
  /** Custom middleware to add to the client */
  middleware?: Middleware[];
}

/**
 * Permissive paths type for development before types are generated.
 * This allows any path string with standard HTTP method structure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PermissivePaths = any;

/**
 * Creates a type-safe fetch client for the API.
 *
 * Note: Until you run `npm run generate:api` with the backend running,
 * paths will be loosely typed. After generation, they become strictly typed.
 *
 * @param config - Configuration options
 * @returns A configured openapi-fetch client
 *
 * @example
 * ```ts
 * const client = createApiClient({
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * const { data, error } = await client.GET('/stores/{storeId}/categories', {
 *   params: { path: { storeId: '123' } }
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig) {
  // Use PermissivePaths during development, will be strictly typed after generation
  const client = createFetchClient<PermissivePaths>({
    baseUrl: config.baseUrl,
    credentials: 'include', // Always send cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  // Add any custom middleware
  if (config.middleware) {
    for (const mw of config.middleware) {
      client.use(mw);
    }
  }

  return client;
}

/**
 * Creates a React Query wrapper around the fetch client.
 *
 * @param fetchClient - The openapi-fetch client to wrap
 * @returns A client with useQuery, useMutation, etc. hooks
 *
 * @example
 * ```ts
 * const fetchClient = createApiClient({ baseUrl: '...' });
 * const $api = createApiQueryClient(fetchClient);
 *
 * // In a component:
 * const { data, isLoading } = $api.useQuery('get', '/categories', {
 *   params: { query: { storeId } }
 * });
 * ```
 */
export function createApiQueryClient(
  fetchClient: ReturnType<typeof createApiClient>
) {
  return createQueryClient(fetchClient);
}

/**
 * Type helper for the fetch client
 */
export type ApiFetchClient = ReturnType<typeof createApiClient>;

/**
 * Type helper for the query client
 */
export type ApiQueryClient = ReturnType<typeof createApiQueryClient>;

// Re-export middleware type for custom middleware creation
export type { Middleware } from 'openapi-fetch';
