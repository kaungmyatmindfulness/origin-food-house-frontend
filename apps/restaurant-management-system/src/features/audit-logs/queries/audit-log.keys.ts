import type { AuditLogFilters } from '../types/audit-log.types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,

  lists: (storeId: string) =>
    [...auditLogKeys.all, 'list', { storeId }] as const,

  list: (storeId: string, page: number, filters: AuditLogFilters) =>
    [...auditLogKeys.lists(storeId), page, filters] as const,

  export: (storeId: string, filters: AuditLogFilters) =>
    [...auditLogKeys.all, 'export', { storeId }, filters] as const,
};
