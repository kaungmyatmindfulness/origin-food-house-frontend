/**
 * Menu Service
 *
 * Service layer for menu-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { CategoryResponseDto } from '@repo/api/generated/types';

/**
 * Retrieves categories (with menu items) for a specific store by slug.
 * The storeId parameter accepts either UUID or slug.
 *
 * @param storeSlug - The store slug or ID
 * @returns Array of categories with nested menu items
 * @throws {ApiError} If the request fails
 */
export async function getCategories(
  storeSlug: string
): Promise<CategoryResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/categories',
    {
      params: { path: { storeId: storeSlug } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve categories',
      response.status
    );
  }

  return data.data;
}
