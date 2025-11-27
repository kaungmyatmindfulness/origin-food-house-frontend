/**
 * API Client Middleware
 *
 * Provides reusable middleware for openapi-fetch clients.
 */

import { toast } from 'sonner';

import type { Middleware } from 'openapi-fetch';

/**
 * Creates an auth middleware that handles 401 responses.
 *
 * @param onUnauthorized - Callback to execute when a 401 response is received
 * @returns A middleware that handles unauthorized responses
 *
 * @example
 * ```ts
 * const authMiddleware = createAuthMiddleware(() => {
 *   useAuthStore.getState().clearAuth();
 * });
 *
 * const client = createApiClient({
 *   baseUrl: '...',
 *   middleware: [authMiddleware],
 * });
 * ```
 */
export function createAuthMiddleware(onUnauthorized: () => void): Middleware {
  return {
    async onResponse({ response }) {
      if (response.status === 401) {
        onUnauthorized();
      }
      return response;
    },
  };
}

/**
 * Middleware that shows toast notifications for API errors.
 *
 * @returns A middleware that displays error toasts
 *
 * @example
 * ```ts
 * const client = createApiClient({
 *   baseUrl: '...',
 *   middleware: [errorToastMiddleware()],
 * });
 * ```
 */
export function errorToastMiddleware(): Middleware {
  return {
    async onResponse({ response, request }) {
      if (!response.ok) {
        const url = new URL(request.url);

        // Try to parse error message from response
        let errorMessage = 'An error occurred';
        try {
          const clonedResponse = response.clone();
          const json = await clonedResponse.json();

          // Handle our backend's StandardApiResponse format
          if (json.message) {
            errorMessage = json.message;
          } else if (json.errors?.[0]?.message) {
            errorMessage = json.errors[0].message;
          }
        } catch {
          // Response may not be JSON
          errorMessage = response.statusText || 'Request failed';
        }

        toast.error(errorMessage, {
          description: `Status: ${response.status} - ${url.pathname}`,
        });
      }
      return response;
    },
    async onError({ error }) {
      // Network errors
      toast.error('Network error', {
        description:
          error instanceof Error ? error.message : 'Failed to connect to API',
      });
      // Return the error for further handling
      return error instanceof Error ? error : new Error('Network error');
    },
  };
}

/**
 * Middleware that logs all requests and responses (development only).
 *
 * @returns A middleware that logs request/response details
 */
export function loggingMiddleware(): Middleware {
  return {
    async onRequest({ request }) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${request.method} ${request.url}`);
      }
      return request;
    },
    async onResponse({ response, request }) {
      if (process.env.NODE_ENV === 'development') {
        const status = response.ok ? '✓' : '✗';
        console.log(
          `[API] ${status} ${request.method} ${request.url} → ${response.status}`
        );
      }
      return response;
    },
  };
}
