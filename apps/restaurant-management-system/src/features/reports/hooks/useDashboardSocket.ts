import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/utils/socket-provider';

import { reportKeys } from '../queries/report.keys';

/**
 * Custom hook for listening to dashboard/metrics WebSocket events
 *
 * Events handled:
 * - metrics:updated - Real-time metrics update
 * - sales:updated - Sales data changed
 * - report:updated - Report data refreshed
 *
 * Features:
 * - Automatic React Query cache invalidation for all reports
 * - Store-specific room subscription
 *
 * @param storeId - The store ID to listen for (joins room)
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const storeId = useAuthStore(selectSelectedStoreId);
 *   useDashboardSocket(storeId);
 *
 *   // Component will automatically receive real-time metrics updates
 * }
 * ```
 */
export function useDashboardSocket(storeId: string | null) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !storeId) {
      return;
    }

    socket.emit('dashboard:join', { storeId });

    const handleMetricsUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });
    };

    const handleSalesUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });
    };

    const handleReportUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });
    };

    socket.on('metrics:updated', handleMetricsUpdated);
    socket.on('sales:updated', handleSalesUpdated);
    socket.on('report:updated', handleReportUpdated);

    return () => {
      socket.emit('dashboard:leave', { storeId });
      socket.off('metrics:updated', handleMetricsUpdated);
      socket.off('sales:updated', handleSalesUpdated);
      socket.off('report:updated', handleReportUpdated);
    };
  }, [socket, isConnected, storeId, queryClient]);
}
