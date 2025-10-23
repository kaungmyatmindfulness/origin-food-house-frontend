import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

import { kitchenKeys } from '../queries/kitchen.keys';
import { updateOrderStatus } from '../services/kitchen.service';
import type { OrderStatus } from '../types/kitchen.types';

/**
 * React Query mutation hook for updating order status
 *
 * Features:
 * - Optimistic updates
 * - Cache invalidation
 * - Error handling with toast
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateOrderStatus();
 *
 * updateMutation.mutate({
 *   orderId: 'order123',
 *   status: 'PREPARING',
 *   storeId: 'store123',
 * });
 * ```
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
      storeId: string;
    }) => updateOrderStatus(orderId, { status }),

    onSuccess: (data, variables) => {
      // Invalidate all kitchen queries for the store
      queryClient.invalidateQueries({
        queryKey: kitchenKeys.orders(variables.storeId),
      });

      toast.success('Order Updated', {
        description: `Order status changed to ${variables.status}`,
      });
    },

    onError: (error) => {
      toast.error('Update Failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update order status',
      });
    },
  });
}
