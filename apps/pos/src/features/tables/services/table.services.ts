/**
 * services/table.service.ts
 *
 * Service functions for interacting with table API endpoints.
 */
import { apiFetch } from '@/utils/apiFetch';

import type {
  TableResponseDto,
  BatchReplaceTablesDto,
  BatchOperationResponseDto,
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
 * Replaces ALL existing tables for a store with the provided list. (OWNER/ADMIN Required)
 * Maps to: PUT /stores/{storeId}/tables/batch-replace
 *
 * @param storeId - The ID (UUID string) of the store whose tables are being replaced.
 * @param payload - The batch replacement payload containing the new list of tables.
 * @returns A promise resolving to the BatchOperationResponseDto (contains count).
 * @throws {NetworkError | ApiError | UnauthorizedError | ForbiddenError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function replaceAllTables(
  storeId: string,
  payload: BatchReplaceTablesDto
): Promise<BatchOperationResponseDto> {
  const res = await apiFetch<BatchOperationResponseDto>(
    `${STORE_ENDPOINT_BASE}/${storeId}/tables/batch-replace`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );

  if (!res.data) {
    console.error(
      `API Error: replaceAllTables(storeId: ${storeId}) succeeded but returned null data.`
    );
    throw new Error(
      'Failed to replace tables: No response data returned by API.'
    );
  }
  return res.data;
}
