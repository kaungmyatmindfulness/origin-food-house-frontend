'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/utils/socket-provider';

import { salesKeys } from '../queries/sales.keys';

/**
 * Event payload for order updated events
 */
interface OrderUpdatedEvent {
  orderId: string;
  storeId: string;
  status: string;
}

/**
 * Event payload for order item status updates
 */
interface OrderItemStatusEvent {
  orderId: string;
  itemId: string;
  status: string;
}

/**
 * Custom hook for listening to sales-related WebSocket events
 *
 * Events handled:
 * - order:created - New order placed
 * - order:updated - Order status changed (e.g., PREPARING, READY, COMPLETED)
 * - order:item:status - Individual item status update from kitchen
 *
 * Features:
 * - Automatic React Query cache invalidation
 * - Store-specific room subscription
 * - Configurable enabled state
 *
 * @param storeId - The store ID to listen for (joins room)
 * @param options - Optional configuration (enabled flag)
 *
 * @example
 * ```tsx
 * function SalesPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   const { isConnected } = useSalesSocket(storeId);
 *
 *   // Component will automatically receive real-time order updates
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditionally enable socket
 * function ConditionalSalesPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   const { isConnected } = useSalesSocket(storeId, { enabled: isActive });
 * }
 * ```
 */
export function useSalesSocket(
  storeId: string | null,
  options: { enabled?: boolean } = {}
): { isConnected: boolean } {
  const { enabled = true } = options;
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !storeId || !enabled) {
      return;
    }

    // Join the store room to receive store-specific broadcasts
    socket.emit('sales:join', { storeId });

    /**
     * Handle new order created - invalidate active orders list
     */
    const handleOrderCreated = () => {
      queryClient.invalidateQueries({
        queryKey: salesKeys.activeOrders(storeId),
      });
    };

    /**
     * Handle order updated - invalidate both active orders and specific order
     */
    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      queryClient.invalidateQueries({
        queryKey: salesKeys.activeOrders(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: salesKeys.order(event.orderId),
      });
    };

    /**
     * Handle individual item status update from kitchen
     */
    const handleItemStatusUpdate = (event: OrderItemStatusEvent) => {
      queryClient.invalidateQueries({
        queryKey: salesKeys.order(event.orderId),
      });
    };

    // Register event listeners
    socket.on('order:created', handleOrderCreated);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:item:status', handleItemStatusUpdate);

    // Cleanup function
    return () => {
      socket.emit('sales:leave', { storeId });
      socket.off('order:created', handleOrderCreated);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:item:status', handleItemStatusUpdate);
    };
  }, [socket, isConnected, storeId, enabled, queryClient]);

  return { isConnected };
}
