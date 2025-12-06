/**
 * Table Service
 *
 * Service layer for table management API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  TableResponseDto,
  BatchUpsertTableDto,
} from '@repo/api/generated/types';

/**
 * Gets all tables for a specific store.
 *
 * @param storeId - The ID of the store
 * @returns Array of tables
 * @throws {ApiError} If the request fails
 */
export async function getAllTables(
  storeId: string
): Promise<TableResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/api/v1/stores/{storeId}/tables',
    {
      params: { path: { storeId } },
    }
  );

  if (error) {
    throw new ApiError('Failed to fetch tables', response?.status ?? 500);
  }

  if (data?.data == null) {
    console.warn(
      `API Warning: getAllTables(storeId: ${storeId}) returned null data. Returning [].`
    );
    return [];
  }

  return data.data;
}

/**
 * Synchronizes tables for a store.
 * Creates/Updates tables based on the input list.
 * Deletes any existing tables not included in the input list.
 *
 * @param storeId - The ID of the store
 * @param payload - The synchronization payload containing tables to upsert
 * @returns Final list of tables after sync
 * @throws {ApiError} If the request fails
 */
export async function syncTables(
  storeId: string,
  payload: BatchUpsertTableDto
): Promise<TableResponseDto[]> {
  const { data, error, response } = await apiClient.PUT(
    '/api/v1/stores/{storeId}/tables/batch-sync',
    {
      params: { path: { storeId } },
      body: payload,
    }
  );

  if (error || data?.data == null) {
    throw new ApiError(
      'Failed to sync tables: No response data returned.',
      response?.status ?? 500
    );
  }

  return data.data;
}
