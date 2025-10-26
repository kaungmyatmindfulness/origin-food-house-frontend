/**
 * Query key factory for Personnel module
 * Following TkDodo's hierarchical key pattern
 */

export const personnelKeys = {
  all: ['personnel'] as const,

  staff: (storeId: string) =>
    [...personnelKeys.all, 'staff', { storeId }] as const,

  staffMember: (storeId: string, userId: string) =>
    [...personnelKeys.staff(storeId), userId] as const,

  invitations: (storeId: string) =>
    [...personnelKeys.all, 'invitations', { storeId }] as const,
};
