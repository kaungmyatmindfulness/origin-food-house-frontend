/**
 * Store Service
 *
 * Service layer for store-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { GetStoreDetailsResponseDto } from '../types/store.types';

/**
 * Retrieves store details by ID.
 */
export async function getStoreDetails(
  id: string
): Promise<GetStoreDetailsResponseDto> {
  const { data, error, response } = await apiClient.GET('/stores/{id}', {
    params: { path: { id } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve store details',
      response.status
    );
  }

  return data.data as GetStoreDetailsResponseDto;
}
