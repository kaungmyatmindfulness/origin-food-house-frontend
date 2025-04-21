import { apiFetch } from '@/utils/apiFetch';

import type {
  TableResponseDto,
  BatchUpsertTableDto,
} from '../types/table.types';

const STORE_ENDPOINT_BASE = '/stores';

/**
 * Get all tables for a specific store. (Public)
 * Maps to: GET /stores/{storeId}/tables
 *
 * @param storeId - The ID (UUID string) of the store whose tables are to be fetched.
 * @returns A promise resolving to an array of TableResponseDto objects.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors (e.g., 404 if store not found).
 */
export async function getAllTables(
  storeId: string
): Promise<TableResponseDto[]> {
  const res = await apiFetch<TableResponseDto[]>(
    `${STORE_ENDPOINT_BASE}/${storeId}/tables`
  );

  if (res.data == null) {
    console.warn(
      `API Warning: getAllTables(storeId: ${storeId}) succeeded but returned null/undefined data. Returning [].`
    );
    return [];
  }
  return res.data;
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
 * @throws {NetworkError | ApiError | UnauthorizedError | ForbiddenError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function syncTables(
  storeId: string,
  payload: BatchUpsertTableDto
): Promise<TableResponseDto[]> {
  const res = await apiFetch<TableResponseDto[]>(
    `${STORE_ENDPOINT_BASE}/${storeId}/tables/batch-sync`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );

  if (res.data == null) {
    console.error(
      `API Error: syncTables(storeId: ${storeId}) succeeded but returned null/undefined data.`
    );
    throw new Error('Failed to sync tables: No response data returned by API.');
  }

  return res.data;
}
