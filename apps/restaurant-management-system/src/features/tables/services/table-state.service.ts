/**
 * Table State Service
 *
 * Service layer for table status management API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  TableWithStatusDto,
  UpdateTableStatusDto,
} from '../types/table-state.types';

/**
 * Gets all tables with status for a store.
 *
 * Note: The API returns basic TableResponseDto. This function casts to
 * TableWithStatusDto which includes extended fields (currentStatus, activeSession)
 * that are pending backend implementation.
 *
 * @param storeId - The ID of the store
 * @returns Array of tables with status information
 * @throws {ApiError} If the request fails
 */
export async function getTablesWithStatus(
  storeId: string
): Promise<TableWithStatusDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/tables',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError('Failed to fetch tables', response?.status ?? 500);
  }

  // Cast to extended type - currentStatus/activeSession may be undefined
  // until backend implements these fields
  return data.data.map((table) => ({
    ...table,
    currentStatus: 'VACANT' as const, // Default status until backend provides it
  }));
}

/**
 * Updates a table's status.
 *
 * Note: This endpoint is pending backend implementation.
 * Currently simulates success for UI development.
 *
 * @param storeId - The ID of the store
 * @param tableId - The ID of the table to update
 * @param dto - The status update payload
 * @returns Updated table with status
 * @throws {ApiError} If the request fails
 */
export async function updateTableStatus(
  _storeId: string,
  tableId: string,
  dto: UpdateTableStatusDto
): Promise<TableWithStatusDto> {
  // TODO: Replace with actual API call when backend implements status updates
  // The API doesn't support table status updates yet, so we simulate success
  // This allows the UI to be developed in advance of backend implementation

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return simulated updated table
  return {
    id: tableId,
    storeId: _storeId,
    name: `Table`, // Will be updated when API supports this
    currentStatus: dto.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
