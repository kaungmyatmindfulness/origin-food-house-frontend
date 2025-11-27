/**
 * Table State Service
 *
 * Service layer for table status management API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  TableResponseDto,
  UpdateTableStatusDto,
} from '@repo/api/generated/types';

/**
 * Gets all tables with status for a store.
 *
 * @param storeId - The ID of the store
 * @returns Array of tables with status information
 * @throws {ApiError} If the request fails
 */
export async function getTablesWithStatus(
  storeId: string
): Promise<TableResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/tables',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      'Failed to fetch tables',
      response?.status ?? 500
    );
  }

  return data.data;
}

/**
 * Updates a table's status.
 *
 * @param storeId - The ID of the store
 * @param tableId - The ID of the table to update
 * @param dto - The status update payload
 * @returns Updated table with status
 * @throws {ApiError} If the request fails
 */
export async function updateTableStatus(
  storeId: string,
  tableId: string,
  dto: UpdateTableStatusDto
): Promise<TableResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/tables/{tableId}',
    {
      params: { path: { storeId, tableId } },
      body: dto,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      'Failed to update table status',
      response?.status ?? 500
    );
  }

  return data.data;
}
