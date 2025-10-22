import type { KdsQueryParams, OrderStatus } from '../types/kitchen.types';

/**
 * Kitchen Query Key Factory
 * Hierarchical cache keys for React Query
 *
 * Pattern:
 * - All kitchen queries start with ['kitchen']
 * - Specific queries append additional parameters
 * - This enables granular cache invalidation
 *
 * @example
 * // Invalidate all kitchen data
 * queryClient.invalidateQueries({ queryKey: kitchenKeys.all });
 *
 * // Invalidate specific store's orders
 * queryClient.invalidateQueries({ queryKey: kitchenKeys.orders(storeId) });
 *
 * // Invalidate orders with specific status
 * queryClient.invalidateQueries({
 *   queryKey: kitchenKeys.ordersByStatus(storeId, 'PENDING')
 * });
 */
export const kitchenKeys = {
  /**
   * Base key for all kitchen queries
   */
  all: ['kitchen'] as const,

  /**
   * All orders for a specific store
   */
  orders: (storeId: string) =>
    [...kitchenKeys.all, 'orders', { storeId }] as const,

  /**
   * Orders filtered by status
   */
  ordersByStatus: (storeId: string, status?: OrderStatus) =>
    [
      ...kitchenKeys.orders(storeId),
      'status',
      { status: status || 'all' },
    ] as const,

  /**
   * Paginated KDS orders with full query params
   */
  kdsOrders: (params: KdsQueryParams) =>
    [...kitchenKeys.all, 'kds', params] as const,

  /**
   * Single order by ID
   */
  order: (storeId: string, orderId: string) =>
    [...kitchenKeys.orders(storeId), orderId] as const,

  /**
   * Kitchen statistics for a store
   */
  stats: (storeId: string) =>
    [...kitchenKeys.all, 'stats', { storeId }] as const,
} as const;
