/**
 * Menu Service
 *
 * Service layer for menu-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { Category } from '../types/menu.types';

/**
 * Retrieves categories for a specific store by slug.
 */
export async function getCategories(storeSlug: string): Promise<Category[]> {
  const { data, error, response } = await apiClient.GET('/categories', {
    params: { query: { storeSlug } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve categories',
      response.status
    );
  }

  return data.data as Category[];
}
