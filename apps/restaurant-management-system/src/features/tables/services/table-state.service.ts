/**
 * Table state service - API calls for table status management
 */

import { apiFetch, unwrapData } from '@/utils/apiFetch';
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
  const res = await apiFetch<TableWithStatusDto[]>(
    `/stores/${storeId}/tables`,
    { method: 'GET' }
  );
  return unwrapData(res, 'Failed to fetch tables');
}

/**
 * Update table status
 */
export async function updateTableStatus(
  storeId: string,
  tableId: string,
  dto: UpdateTableStatusDto
): Promise<TableWithStatusDto> {
  const res = await apiFetch<TableWithStatusDto>(
    `/stores/${storeId}/tables/${tableId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }
  );
  return unwrapData(res, 'Failed to update table status');
}
