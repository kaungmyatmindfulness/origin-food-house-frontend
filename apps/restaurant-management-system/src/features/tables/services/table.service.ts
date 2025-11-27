/**
 * Table Service
 *
 * Service layer for table management API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  TableResponseDto,
  BatchUpsertTableDto,
} from '../types/table.types';

/**
 * Get all tables for a specific store. (Public)
 * Maps to: GET /stores/{storeId}/tables
 *
 * @param storeId - The ID (UUID string) of the store whose tables are to be fetched.
 * @returns A promise resolving to an array of TableResponseDto objects.
 * @throws {ApiError} - Throws on fetch/API errors (e.g., 404 if store not found).
 */
export async function getAllTables(
  storeId: string
): Promise<TableResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/tables',
    {
      params: { path: { storeId } },
    }
  );

  if (error) {
    throw new ApiError(
      data?.message || 'Failed to fetch tables',
      response.status
    );
  }

  if (data?.data == null) {
    console.warn(
      `API Warning: getAllTables(storeId: ${storeId}) succeeded but returned null/undefined data. Returning [].`
    );
    return [];
  }

  return data.data as TableResponseDto[];
}

/**
 * Synchronizes tables for a store. Creates/Updates tables based on the input list.
 * Deletes any existing tables for the store that are NOT included in the input list (by ID).
 * Requires OWNER/ADMIN permissions.
 * Maps to: PUT /stores/{storeId}/tables/batch-sync
 *
 * @param storeId - The ID (UUID string) of the store whose tables are being synchronized.
 * @param payload - The synchronization payload containing the list of tables to upsert.
 * @returns A promise resolving to the final list of tables (TableResponseDto[]) for the store after sync.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function syncTables(
  storeId: string,
  payload: BatchUpsertTableDto
): Promise<TableResponseDto[]> {
  const { data, error, response } = await apiClient.PUT(
    '/stores/{storeId}/tables/batch-sync',
    {
      params: { path: { storeId } },
      body: payload,
    }
  );

  if (error || data?.data == null) {
    const errorMsg =
      data?.message ||
      'Failed to sync tables: No response data returned by API.';
    console.error(
      `API Error: syncTables(storeId: ${storeId}) failed - ${errorMsg}`
    );
    throw new ApiError(errorMsg, response.status);
  }

  return data.data as TableResponseDto[];
}
