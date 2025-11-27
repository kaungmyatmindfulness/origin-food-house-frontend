/**
 * Table State Service
 *
 * Service layer for table status management API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  TableWithStatusDto,
  UpdateTableStatusDto,
} from '../types/table-state.types';

/**
 * Get all tables with status for a store
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
    throw new ApiError(
      data?.message || 'Failed to fetch tables',
      response.status
    );
  }

  return data.data as TableWithStatusDto[];
}

/**
 * Update table status
 */
export async function updateTableStatus(
  storeId: string,
  tableId: string,
  dto: UpdateTableStatusDto
): Promise<TableWithStatusDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/tables/{tableId}',
    {
      params: { path: { storeId, tableId } },
      body: dto,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update table status',
      response.status
    );
  }

  return data.data as TableWithStatusDto;
}
