/**
 * Store Service
 *
 * Service layer for store-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError, unwrapApiResponseAs } from '@/utils/apiFetch';
import type {
  CreateStoreDto,
  StoreSettingResponseDto,
  UpdateStoreInformationDto,
  UpdateStoreSettingDto,
} from '@repo/api/generated/types';
import type { GetStoreDetailsResponseDto } from '@/features/store/types/store.types';

/** Store creation response */
interface StoreCreatedResponse {
  id: string;
  name: string;
  slug: string;
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
  const result = await apiClient.GET('/api/v1/stores/{id}', {
    params: { path: { id } },
  });

  return unwrapApiResponseAs<GetStoreDetailsResponseDto>(
    result,
    'Failed to retrieve store details'
  );
}

/**
 * Updates store information.
 *
 * @param id - The store ID (path param)
 * @param storeIdQuery - The store ID (query param)
 * @param storeData - The updated store information
 * @throws {ApiError} If the request fails
 */
export async function updateStoreInformation(
  id: string,
  storeIdQuery: string,
  storeData: UpdateStoreInformationDto
): Promise<void> {
  const { error, response } = await apiClient.PUT(
    '/api/v1/stores/{id}/information',
    {
      params: {
        path: { id },
        query: { storeId: storeIdQuery },
      },
      body: storeData,
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to update store information',
      response?.status ?? 500
    );
  }
}

/**
 * Updates store settings.
 *
 * @param id - The store ID
 * @param storeData - The updated store settings
 * @returns Updated store settings
 * @throws {ApiError} If the request fails
 */
export async function updateStoreSettings(
  id: string,
  storeData: UpdateStoreSettingDto
): Promise<StoreSettingResponseDto> {
  const result = await apiClient.PUT('/api/v1/stores/{id}/settings', {
    params: { path: { id } },
    body: storeData,
  });

  return unwrapApiResponseAs<StoreSettingResponseDto>(
    result,
    'Failed to update store settings'
  );
}

/**
 * Creates a new store.
 *
 * @param storeData - The store data to create
 * @returns Created store
 * @throws {ApiError} If the request fails
 */
export async function createStore(
  storeData: CreateStoreDto
): Promise<StoreCreatedResponse> {
  const result = await apiClient.POST('/api/v1/stores', {
    body: storeData,
  });

  return unwrapApiResponseAs<StoreCreatedResponse>(
    result,
    'Failed to create store'
  );
}
