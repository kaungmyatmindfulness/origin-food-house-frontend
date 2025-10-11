/**
 * Query key factory for authentication-related queries.
 */

export const authKeys = {
  all: ['auth'] as const,

  currentUser: (storeId?: string) =>
    storeId
      ? ([...authKeys.all, 'currentUser', { storeId }] as const)
      : ([...authKeys.all, 'currentUser'] as const),

  protectedCheck: (storeId?: string) =>
    [
      'currentUser',
      'protectedCheck',
      { storeId: storeId ?? 'none' },
    ] as const,
};
