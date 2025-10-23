/**
 * React Query key factory for reports
 */

export const reportKeys = {
  all: ['reports'] as const,

  salesSummary: (storeId: string, startDate: Date, endDate: Date) =>
    [
      ...reportKeys.all,
      'sales-summary',
      {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ] as const,

  popularItems: (
    storeId: string,
    limit: number,
    startDate: Date,
    endDate: Date
  ) =>
    [
      ...reportKeys.all,
      'popular-items',
      {
        storeId,
        limit,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ] as const,

  paymentBreakdown: (storeId: string, startDate: Date, endDate: Date) =>
    [
      ...reportKeys.all,
      'payment-breakdown',
      {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ] as const,
};
