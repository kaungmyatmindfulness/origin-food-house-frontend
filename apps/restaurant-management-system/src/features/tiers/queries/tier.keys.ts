export const tierKeys = {
  all: ['tiers'] as const,

  usage: (storeId: string) => [...tierKeys.all, 'usage', { storeId }] as const,

  comparison: () => [...tierKeys.all, 'comparison'] as const,
};
