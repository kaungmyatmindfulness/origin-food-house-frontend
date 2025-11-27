/**
 * Store Service
 *
 * Service layer for store-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CreateStoreDto,
  GetStoreDetailsResponseDto,
  StoreSettingResponseDto,
  UpdateStoreInformationDto,
  UpdateStoreSettingDto,
} from '@/features/store/types/store.types';

/** Store creation response */
interface StoreCreatedResponse {
  id: string;
  name: string;
  slug: string;
}

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
      response?.status ?? 500
    );
  }

  return res.data;
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
  const { error, response } = await apiClient.PUT('/stores/{id}/information', {
    params: {
      path: { id },
      query: { storeId: storeIdQuery },
    },
    body: storeData,
  });

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
  const { data, error, response } = await apiClient.PUT(
    '/stores/{id}/settings',
    {
      params: { path: { id } },
      body: storeData,
    }
  );

  const res = data as unknown as
    | StandardApiResponse<StoreSettingResponseDto>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to update store settings',
      response?.status ?? 500
    );
  }

  return res.data;
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
  const { data, error, response } = await apiClient.POST('/stores', {
    body: storeData,
  });

  const res = data as unknown as
    | StandardApiResponse<StoreCreatedResponse>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to create store',
      response?.status ?? 500
    );
  }

  return res.data;
}
