/**
 * Query key factory for table-related queries.
 */

export const tableKeys = {
  all: ['tables'] as const,

  lists: (storeId: string) => [...tableKeys.all, 'list', { storeId }] as const,

  detail: (tableId: string) => [...tableKeys.all, 'detail', tableId] as const,
};
