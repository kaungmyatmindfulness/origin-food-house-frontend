/**
 * Store Service
 *
 * Service layer for store-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { GetStoreDetailsResponseDto } from '@repo/api/generated/types';

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Retrieves store details by ID.
 *
 * @param id - The store ID
 * @returns Store details
 * @throws {ApiError} If the request fails
 */
export async function getStoreDetails(
  id: string
): Promise<GetStoreDetailsResponseDto> {
  const { data, error, response } = await apiClient.GET('/stores/{id}', {
    params: { path: { id } },
  });

  const res = data as unknown as
    | StandardApiResponse<GetStoreDetailsResponseDto>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to retrieve store details',
      response.status
    );
  }

  return res.data;
}
