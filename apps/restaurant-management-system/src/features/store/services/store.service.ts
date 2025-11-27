/**
 * Store Service
 *
 * Service layer for store-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CreateStoreDto,
  Store,
  StoreSettingResponseDto,
  UpdateStoreSettingDto,
  GetStoreDetailsResponseDto,
  UpdateStoreInformationDto,
} from '../types/store.types';

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

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve store details',
      response.status
    );
  }

  return data.data as GetStoreDetailsResponseDto;
}

/**
 * Updates store information.
 *
 * @param id - The store ID
 * @param storeIdQuery - The store ID for query param
 * @param storeData - The updated store information
 * @throws {ApiError} If the request fails
 */
export async function updateStoreInformation(
  id: string,
  storeIdQuery: string,
  storeData: UpdateStoreInformationDto
): Promise<void> {
  const { error, response } = await apiClient.PUT(
    '/stores/{id}/information',
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
      response.status
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
  const { data, error, response } = await apiClient.PUT(
    '/stores/{id}/settings',
    {
      params: { path: { id } },
      body: storeData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update store settings',
      response.status
    );
  }

  return data.data as StoreSettingResponseDto;
}

/**
 * Creates a new store.
 *
 * @param storeData - The store data to create
 * @returns Created store
 * @throws {ApiError} If the request fails
 */
export async function createStore(storeData: CreateStoreDto): Promise<Store> {
  const { data, error, response } = await apiClient.POST('/stores', {
    body: storeData,
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to create store',
      response.status
    );
  }

  return data.data as Store;
}
