import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  AuditLogFilters,
  PaginatedAuditLogsResponse,
} from '../types/audit-log.types';

/**
 * Fetches paginated audit logs for a store with optional filters
 */
export async function getAuditLogs(
  _storeId: string,
  page: number,
  filters: AuditLogFilters
): Promise<PaginatedAuditLogsResponse> {
  const storeId = _storeId;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '50',
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    ),
  });

  const res = await apiFetch<PaginatedAuditLogsResponse>(
    `/audit-logs/${storeId}?${params}`
  );

  return unwrapData(res, 'Failed to fetch audit logs');
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
  const token = localStorage.getItem('accessToken'); // Get from auth storage

  const response = await fetch(
    `${baseUrl}/audit-logs/${storeId}/export?${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export audit logs');
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
