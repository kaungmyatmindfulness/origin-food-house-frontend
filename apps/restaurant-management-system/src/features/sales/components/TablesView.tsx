'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@repo/ui/components/skeleton';

import { TableCard } from './TableCard';
import { StartSessionDialog } from './StartSessionDialog';
import { useSalesStore } from '@/features/sales/store/sales.store';
import { salesKeys } from '@/features/sales/queries/sales.keys';

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface TableWithStatus {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentSessionId?: string | null;
  currentOrderTotal?: number;
}

/**
 * TODO: Migrate to $api.useQuery when backend extends TableResponseDto
 *
 * Current API endpoint: GET /stores/{storeId}/tables
 * Returns: TableResponseDto[] with { id, storeId, name, currentStatus, createdAt, updatedAt }
 *
 * This component requires additional fields not in the API:
 * - tableNumber: Use 'name' field (available)
 * - capacity: Not available in API (needs backend implementation)
 * - currentSessionId: Not available in API (needs backend implementation)
 * - currentOrderTotal: Not available in API (needs backend implementation)
 *
 * Migration steps when backend is ready:
 * 1. Backend adds capacity, currentSessionId, currentOrderTotal to TableResponseDto
 * 2. Replace this mock function with:
 *    const { data: response, isLoading } = $api.useQuery(
 *      'get', '/stores/{storeId}/tables',
 *      { params: { path: { storeId } } }
 *    );
 *    const tables = response?.data ?? [];
 */
async function getTablesWithStatus(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _storeId: string
): Promise<TableWithStatus[]> {
  // Returns empty array until backend provides required fields
  return [];
}

interface TablesViewProps {
  storeId: string;
  onTableSessionStart: (sessionId: string, tableId: string) => void;
}

export function TablesView({ storeId, onTableSessionStart }: TablesViewProps) {
  const t = useTranslations('sales');

  const selectedTableId = useSalesStore((state) => state.selectedTableId);
  const setSelectedTable = useSalesStore((state) => state.setSelectedTable);

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedTableForSession, setSelectedTableForSession] =
    useState<TableWithStatus | null>(null);

  const { data: tables, isLoading } = useQuery({
    queryKey: salesKeys.tables(storeId),
    queryFn: () => getTablesWithStatus(storeId),
    staleTime: 30 * 1000,
  });

  const handleTableSelect = (tableId: string) => {
    const table = tables?.find((t) => t.id === tableId);
    if (!table) return;

    if (table.status === 'AVAILABLE') {
      // Open dialog to start session
      setSelectedTableForSession(table);
      setSessionDialogOpen(true);
    } else if (table.status === 'OCCUPIED' && table.currentSessionId) {
      // Select table and load its session/cart
      setSelectedTable(tableId);
      onTableSessionStart(table.currentSessionId, tableId);
    }
  };

  const handleSessionStarted = (sessionId: string) => {
    if (selectedTableForSession) {
      setSelectedTable(selectedTableForSession.id);
      onTableSessionStart(sessionId, selectedTableForSession.id);
      setSelectedTableForSession(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">{t('noTablesFound')}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('configureTablesHint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onSelect={handleTableSelect}
            isSelected={selectedTableId === table.id}
          />
        ))}
      </div>

      <StartSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        storeId={storeId}
        table={selectedTableForSession}
        onSessionStarted={handleSessionStarted}
      />
    </>
  );
}
