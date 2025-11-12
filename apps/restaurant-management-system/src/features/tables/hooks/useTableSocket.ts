'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from '@repo/ui/lib/toast';
import type { TableResponseDto } from '@repo/api/generated/types';

import { useSocket } from '@/utils/socket-provider';

/**
 * Custom hook for listening to table-related WebSocket events
 * Connects to /table namespace for real-time table updates
 *
 * Events handled:
 * - table:status-updated - Table status changed (available, occupied, etc.)
 * - table:created - New table created
 * - table:updated - Table details updated
 * - table:deleted - Table deleted
 * - table:error - Error occurred
 *
 * Features:
 * - Automatic React Query cache invalidation
 * - Toast notifications for user feedback
 * - Store-specific room subscription
 *
 * @param storeId - The store ID to listen for (joins room)
 *
 * @example
 * ```tsx
 * function TablesPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useTableSocket(storeId);
 *
 *   // Component will automatically receive real-time table updates
 * }
 * ```
 */
export function useTableSocket(storeId: string | null) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !storeId) {
      return;
    }

    socket.emit('table:join-store', { storeId });

    const handleTableJoined = ({ storeId: joinedStoreId }: { storeId: string }) => {
      console.log(`[TableSocket] Joined store-${joinedStoreId}`);
    };

    const handleTableStatusUpdated = (
      table: TableResponseDto & { currentStatus: string }
    ) => {
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });
      queryClient.setQueryData(['table', table.id], table);

      toast.info(`Table ${table.name} is now ${table.currentStatus}`, {
        description: 'Table status updated',
      });
    };

    const handleTableCreated = (table: TableResponseDto) => {
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });

      toast.success(`Table ${table.name} created`);
    };

    const handleTableUpdated = (table: TableResponseDto) => {
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });
      queryClient.setQueryData(['table', table.id], table);

      toast.info(`Table ${table.name} updated`);
    };

    const handleTableDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });

      toast.info('Table deleted');
    };

    const handleTableError = ({ message }: { message: string }) => {
      console.error('[TableSocket] Error:', message);
      toast.error('Table operation failed', {
        description: message,
      });
    };

    socket.on('table:joined', handleTableJoined);
    socket.on('table:status-updated', handleTableStatusUpdated);
    socket.on('table:created', handleTableCreated);
    socket.on('table:updated', handleTableUpdated);
    socket.on('table:deleted', handleTableDeleted);
    socket.on('table:error', handleTableError);

    return () => {
      socket.emit('table:leave-store', { storeId });
      socket.off('table:joined', handleTableJoined);
      socket.off('table:status-updated', handleTableStatusUpdated);
      socket.off('table:created', handleTableCreated);
      socket.off('table:updated', handleTableUpdated);
      socket.off('table:deleted', handleTableDeleted);
      socket.off('table:error', handleTableError);
    };
  }, [socket, isConnected, storeId, queryClient]);

  return {
    isConnected,
  };
}
