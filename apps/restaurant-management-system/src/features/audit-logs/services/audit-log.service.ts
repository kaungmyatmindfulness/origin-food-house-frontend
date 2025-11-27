/**
 * Audit Log Service
 *
 * Service layer for audit log-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  AuditLogFilters,
  PaginatedAuditLogsResponse,
} from '../types/audit-log.types';

/**
 * Fetches paginated audit logs for a store with optional filters
 */
export async function getAuditLogs(
  storeId: string,
  page: number,
  filters: AuditLogFilters
): Promise<PaginatedAuditLogsResponse> {
  // Build query params from filters
  const queryParams: Record<string, string> = {
    page: page.toString(),
    limit: '50',
  };

  // Add non-empty filters to query params
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      queryParams[key] = String(value);
    }
  }

  const { data, error, response } = await apiClient.GET(
    '/audit-logs/{storeId}',
    {
      params: {
        path: { storeId },
        query: queryParams,
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch audit logs',
      response.status
    );
  }

  return data.data as PaginatedAuditLogsResponse;
}

/**
 * Exports audit logs to CSV format
 */
export async function exportAuditLogsCsv(
  storeId: string,
  filters: AuditLogFilters
): Promise<Blob> {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
  );

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Note: Using raw fetch for blob response since openapi-fetch doesn't handle blob responses well
  const response = await fetch(
    `${baseUrl}/audit-logs/${storeId}/export?${params}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to export audit logs', response.status);
  }

  return response.blob();
}

/**
 * Downloads CSV blob as a file
 */
export function downloadCsvBlob(blob: Blob, storeId: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${storeId}-${new Date().toISOString().split('T')[0]}.csv`;
  a.style.visibility = 'hidden';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
