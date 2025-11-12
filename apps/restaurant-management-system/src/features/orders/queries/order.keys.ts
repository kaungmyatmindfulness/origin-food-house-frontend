export const orderKeys = {
  all: ['orders'] as const,

  lists: () => [...orderKeys.all, 'list'] as const,

  list: (storeId: string, filters?: Record<string, unknown>) =>
    [...orderKeys.lists(), { storeId, ...filters }] as const,

  details: () => [...orderKeys.all, 'detail'] as const,

  detail: (storeId: string, orderId: string) =>
    [...orderKeys.details(), { storeId, orderId }] as const,
};
