import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';

// Re-export error classes and types for backwards compatibility
export {
  FetchError,
  NetworkError,
  ApiError,
  UnauthorizedError,
} from '@repo/api/utils/apiFetch';

export type { StandardApiResponse } from '@repo/api/types/api.types';

// Create configured apiFetch instance (SOS app doesn't need auth handling)
export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
});

// Re-export unwrapData helper
export { unwrapData };
