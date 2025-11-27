/**
 * @repo/api - Shared API utilities and types
 *
 * This package provides:
 * - Type-safe API clients (openapi-fetch + openapi-react-query)
 * - Auto-generated types from OpenAPI spec
 * - S3 image utilities
 * - Reusable middleware (auth, error handling)
 */

// S3 image utilities
export * from './utils/s3-url';

// API client setup
export {
  createApiClient,
  createApiQueryClient,
  type ApiClientConfig,
  type ApiFetchClient,
  type ApiQueryClient,
  type paths,
  type components,
} from './client/index';

// Middleware utilities
export {
  createAuthMiddleware,
  errorToastMiddleware,
  loggingMiddleware,
} from './client/middleware';

// Re-export Middleware type for custom middleware creation
export type { Middleware } from 'openapi-fetch';
