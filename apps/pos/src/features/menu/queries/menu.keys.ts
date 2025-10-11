/**
 * Query key factory for menu-related queries.
 * Centralizes all menu query keys to prevent typos and ensure consistency.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const menuKeys = {
  all: ['menu'] as const,

  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,

  category: (storeId: string, categoryId: string) =>
    [...menuKeys.categories(storeId), categoryId] as const,

  items: (storeId: string) =>
    [...menuKeys.all, 'items', { storeId }] as const,

  item: (storeId: string, itemId: string) =>
    [...menuKeys.items(storeId), itemId] as const,
};
