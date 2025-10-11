import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';
import { useAuthStore } from '@/features/auth/store/auth.store';

// Re-export error classes and types for backwards compatibility
export {
  FetchError,
  NetworkError,
  ApiError,
  UnauthorizedError,
} from '@repo/api/utils/apiFetch';

export type { StandardApiResponse } from '@repo/api/types/api.types';

// Create configured apiFetch instance with auth handling
export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  onUnauthorized: () => {
    try {
      useAuthStore.getState().clearAuth();
    } catch (error) {
      console.error('Failed to clear auth on 401:', error);
    }
  },
});

// Re-export unwrapData helper
export { unwrapData };
