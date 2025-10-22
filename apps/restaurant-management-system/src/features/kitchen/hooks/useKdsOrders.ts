import { useQuery } from '@tanstack/react-query';

import { kitchenKeys } from '../queries/kitchen.keys';
import { getKdsOrders } from '../services/kitchen.service';
import type { KdsQueryParams } from '../types/kitchen.types';

/**
 * React Query hook for fetching KDS orders
 *
 * @param params - Query parameters including storeId, status filter, and pagination
 * @param options - Additional React Query options
 * @returns Query result with paginated orders
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useKdsOrders({
 *   storeId: 'abc123',
 *   status: 'PENDING',
 *   page: 1,
 *   limit: 20,
 * });
 * ```
 */
export function useKdsOrders(
  params: KdsQueryParams,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: kitchenKeys.kdsOrders(params),
    queryFn: () => getKdsOrders(params),
    enabled: options?.enabled !== false && !!params.storeId,
    refetchInterval: options?.refetchInterval,
    staleTime: 10 * 1000, // 10 seconds - orders change frequently
  });
}
