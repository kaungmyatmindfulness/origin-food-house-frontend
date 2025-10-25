'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io, { Socket } from 'socket.io-client';

import { toast } from '@repo/ui/lib/toast';
import type { TableResponseDto } from '@repo/api/generated/types';

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let tableSocket: Socket | null = null;

/**
 * WebSocket hook for real-time table status updates
 * Connects to /table namespace and listens for table events
 */
export function useTableSocket(storeId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!storeId) return;

    // Create socket connection to /table namespace
    if (!tableSocket) {
      tableSocket = io(`${WS_URL}/table`, {
        withCredentials: true,
        transports: ['websocket'],
      });

      tableSocket.on('connect', () => {
        console.log('[useTableSocket] Connected to table WebSocket');
      });

      tableSocket.on('disconnect', () => {
        console.log('[useTableSocket] Disconnected from table WebSocket');
      });

      tableSocket.on('connect_error', (error) => {
        console.error('[useTableSocket] Connection error:', error);
      });
    }

    // Join store room
    tableSocket.emit('table:join-store', { storeId });

    // Listen for table events
    tableSocket.on('table:joined', ({ storeId: joinedStoreId }) => {
      console.log(`[useTableSocket] Joined store-${joinedStoreId}`);
    });

    tableSocket.on(
      'table:status-updated',
      (table: TableResponseDto & { currentStatus: string }) => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['tables', storeId] });
        queryClient.setQueryData(['table', table.id], table);

        // Show toast notification
        toast.info(`Table ${table.name} is now ${table.currentStatus}`, {
          description: 'Table status updated',
        });
      }
    );

    tableSocket.on('table:created', (table: TableResponseDto) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });

      // Show toast notification
      toast.success(`Table ${table.name} created`);
    });

    tableSocket.on('table:updated', (table: TableResponseDto) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });
      queryClient.setQueryData(['table', table.id], table);

      // Show toast notification
      toast.info(`Table ${table.name} updated`);
    });

    tableSocket.on('table:deleted', () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });

      // Show toast notification
      toast.info('Table deleted');
    });

    tableSocket.on('table:error', ({ message }: { message: string }) => {
      console.error('[useTableSocket] Error:', message);
      toast.error('Table operation failed', {
        description: message,
      });
    });

    // Cleanup on unmount
    return () => {
      if (tableSocket) {
        tableSocket.off('table:joined');
        tableSocket.off('table:status-updated');
        tableSocket.off('table:created');
        tableSocket.off('table:updated');
        tableSocket.off('table:deleted');
        tableSocket.off('table:error');
      }
    };
  }, [storeId, queryClient]);

  return {
    isConnected: tableSocket?.connected ?? false,
  };
}
