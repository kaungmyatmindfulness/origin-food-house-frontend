/**
 * Query key factory for store-related queries.
 */

export const storeKeys = {
  all: ['stores'] as const,

  lists: () => [...storeKeys.all, 'list'] as const,

  detail: (storeId: string) => [...storeKeys.all, 'detail', storeId] as const,

  settings: (storeId: string) =>
    [...storeKeys.all, 'settings', storeId] as const,
};
