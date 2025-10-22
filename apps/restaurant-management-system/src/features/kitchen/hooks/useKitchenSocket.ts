import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/utils/socket-provider';

import { kitchenKeys } from '../queries/kitchen.keys';
import {
  selectSoundEnabled,
  useKitchenStore,
} from '../store/kitchen.store';
import type {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
  OrderUpdatedEvent,
} from '../types/kitchen.types';

/**
 * Custom hook for listening to kitchen-related WebSocket events
 *
 * Events handled:
 * - order:created - New order placed
 * - order:updated - Order details changed
 * - order:status-changed - Order status updated
 *
 * Features:
 * - Automatic cache invalidation
 * - Sound notifications (when enabled)
 * - Store state synchronization
 *
 * @param storeId - The store ID to listen for (joins room)
 *
 * @example
 * ```tsx
 * function KitchenDashboard() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useKitchenSocket(storeId);
 *
 *   // Component will automatically receive real-time order updates
 * }
 * ```
 */
export function useKitchenSocket(storeId: string | null) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const addOrder = useKitchenStore((state) => state.addOrder);
  const updateOrder = useKitchenStore((state) => state.updateOrder);
  const updateOrderStatus = useKitchenStore((state) => state.updateOrderStatus);
  const soundEnabled = useKitchenStore(selectSoundEnabled);

  useEffect(() => {
    if (!socket || !isConnected || !storeId) {
      return;
    }

    // Join the store room to receive store-specific broadcasts
    socket.emit('kitchen:join', { storeId });

    /**
     * Handle new order created
     */
    const handleOrderCreated = (event: OrderCreatedEvent) => {
      // Add to store
      addOrder(event.order);

      // Play sound notification if enabled
      if (soundEnabled) {
        playNotificationSound();
      }

      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: kitchenKeys.orders(storeId),
      });
    };

    /**
     * Handle order updated
     */
    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      // Update in store
      updateOrder(event.order.id, event.order);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: kitchenKeys.order(storeId, event.order.id),
      });
    };

    /**
     * Handle order status changed
     */
    const handleOrderStatusChanged = (event: OrderStatusChangedEvent) => {
      // Update status in store
      updateOrderStatus(event.orderId, event.newStatus);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: kitchenKeys.orders(storeId),
      });
    };

    // Register event listeners
    socket.on('order:created', handleOrderCreated);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:status-changed', handleOrderStatusChanged);

    // Cleanup function
    return () => {
      socket.emit('kitchen:leave', { storeId });
      socket.off('order:created', handleOrderCreated);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:status-changed', handleOrderStatusChanged);
    };
  }, [
    socket,
    isConnected,
    storeId,
    queryClient,
    addOrder,
    updateOrder,
    updateOrderStatus,
    soundEnabled,
  ]);
}

/**
 * Plays a notification sound for new orders
 * Uses Web Audio API for cross-browser compatibility
 */
function playNotificationSound() {
  try {
    // Create a simple beep using Web Audio API
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('[KitchenSocket] Failed to play sound:', error);
  }
}
