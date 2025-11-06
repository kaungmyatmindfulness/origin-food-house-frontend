/**
 * Query key factory for user-related queries.
 */

export const userKeys = {
  all: ['users'] as const,

  currentUser: (storeId?: string) =>
    [...userKeys.all, 'current', { storeId }] as const,

  stores: (userId: string) => [...userKeys.all, 'stores', userId] as const,
};
