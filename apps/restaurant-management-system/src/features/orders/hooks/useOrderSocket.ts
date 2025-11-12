import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/utils/socket-provider';

import { orderKeys } from '../queries/order.keys';

interface OrderEvent {
  orderId: string;
  storeId: string;
  [key: string]: unknown;
}

/**
 * Custom hook for listening to order-related WebSocket events
 *
 * Events handled:
 * - order:created - New order placed
 * - order:updated - Order details changed
 * - order:status-changed - Order status updated
 * - order:deleted - Order deleted
 *
 * Features:
 * - Automatic React Query cache invalidation
 * - Store-specific room subscription
 *
 * @param storeId - The store ID to listen for (joins room)
 *
 * @example
 * ```tsx
 * function OrdersPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useOrderSocket(storeId);
 *
 *   // Component will automatically receive real-time order updates
 * }
 * ```
 */
export function useOrderSocket(storeId: string | null) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !storeId) {
      return;
    }

    socket.emit('orders:join', { storeId });

    const handleOrderCreated = () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.list(storeId),
      });
    };

    const handleOrderUpdated = (event: OrderEvent) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(storeId, event.orderId),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.list(storeId),
      });
    };

    const handleOrderStatusChanged = (event: OrderEvent) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(storeId, event.orderId),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.list(storeId),
      });
    };

    const handleOrderDeleted = () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.list(storeId),
      });
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:status-changed', handleOrderStatusChanged);
    socket.on('order:deleted', handleOrderDeleted);

    return () => {
      socket.emit('orders:leave', { storeId });
      socket.off('order:created', handleOrderCreated);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:status-changed', handleOrderStatusChanged);
      socket.off('order:deleted', handleOrderDeleted);
    };
  }, [socket, isConnected, storeId, queryClient]);
}
