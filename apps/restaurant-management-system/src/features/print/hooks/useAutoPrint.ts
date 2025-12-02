/**
 * Hook for automatic printing based on Socket.IO events.
 *
 * Listens for order:created events and automatically prints kitchen tickets
 * when auto-print is enabled in settings.
 */

import { useEffect, useCallback } from 'react';

import { useSocketOptional } from '@/utils/socket-provider';
import { usePrintService } from './usePrintService';
import { usePrintSettings } from './usePrintSettings';

import type { OrderResponseDto } from '@repo/api/generated/types';

interface UseAutoPrintOptions {
  /** Store ID to filter events and fetch settings */
  storeId: string;
  /** Whether auto-print is enabled (default: true) */
  enabled?: boolean;
}

interface OrderCreatedEvent {
  order: OrderResponseDto;
  storeId?: string;
}

/**
 * Hook for automatic printing based on Socket.IO order events.
 *
 * When an order:created event is received and auto-print is enabled,
 * this hook will automatically print a kitchen ticket for the order.
 *
 * **Note:** This hook uses `useSocketOptional` internally, so it can be used
 * without a SocketProvider. Auto-print will only work when:
 * 1. The component is wrapped in a SocketProvider
 * 2. The socket is connected
 * 3. Auto-print kitchen ticket is enabled in settings
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // With SocketProvider (auto-print works)
 * function KitchenPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useAutoPrint({ storeId: storeId ?? '' });
 *
 *   return (
 *     <SocketProvider>
 *       <KitchenDisplay />
 *     </SocketProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Without SocketProvider (hook is safe, auto-print disabled)
 * function SalesPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useAutoPrint({ storeId: storeId ?? '' }); // Safe - won't crash
 *
 *   return <SalesInterface />;
 * }
 * ```
 */
export function useAutoPrint({
  storeId,
  enabled = true,
}: UseAutoPrintOptions): void {
  // Use optional socket hook - auto-print only works when SocketProvider is present
  const { socket, isConnected } = useSocketOptional();
  const { printKitchenTicket } = usePrintService({
    storeId,
    autoProcess: true,
  });
  const { settings } = usePrintSettings(storeId);

  // Handler for order:created events
  const handleOrderCreated = useCallback(
    (event: OrderCreatedEvent) => {
      // Skip if settings don't allow auto-print
      if (!settings?.autoPrintKitchenTicket) {
        return;
      }

      // Verify this event is for our store
      if (event.storeId && event.storeId !== storeId) {
        return;
      }

      // Print kitchen ticket
      if (event.order) {
        printKitchenTicket(event.order);
      }
    },
    [settings?.autoPrintKitchenTicket, storeId, printKitchenTicket]
  );

  useEffect(() => {
    // Guard conditions
    if (!socket || !isConnected || !storeId || !enabled) {
      return;
    }

    // Don't subscribe if auto-print is disabled in settings
    if (!settings?.autoPrintKitchenTicket) {
      return;
    }

    // Subscribe to order:created events
    socket.on('order:created', handleOrderCreated);

    // Cleanup on unmount or dependency change
    return () => {
      socket.off('order:created', handleOrderCreated);
    };
  }, [
    socket,
    isConnected,
    storeId,
    enabled,
    settings?.autoPrintKitchenTicket,
    handleOrderCreated,
  ]);
}
