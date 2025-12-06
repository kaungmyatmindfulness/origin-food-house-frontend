'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@repo/ui/components/skeleton';

import { TableCard } from './TableCard';
import { StartSessionDialog } from './StartSessionDialog';
import { useSalesStore } from '@/features/sales/store/sales.store';
import { $api } from '@/utils/apiFetch';

import type { TableStatus as ApiTableStatus } from '@repo/api/generated/types';

/**
 * UI-specific table status that maps from API status.
 * The API uses: VACANT | SEATED | ORDERING | SERVED | READY_TO_PAY
 * The UI simplifies to: AVAILABLE | OCCUPIED | RESERVED | CLEANING
 */
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
 * Maps API table status to UI status for display purposes.
 * VACANT -> AVAILABLE (table is free)
 * SEATED/ORDERING/SERVED/READY_TO_PAY -> OCCUPIED (table has customers)
 */
function mapApiStatusToUIStatus(apiStatus: ApiTableStatus): TableStatus {
  switch (apiStatus) {
    case 'VACANT':
      return 'AVAILABLE';
    case 'SEATED':
    case 'ORDERING':
    case 'SERVED':
    case 'READY_TO_PAY':
      return 'OCCUPIED';
    default:
      return 'AVAILABLE';
  }
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

  // Fetch tables from API and transform to UI format
  const { data: response, isLoading } = $api.useQuery(
    'get',
    '/stores/{storeId}/tables',
    { params: { path: { storeId } } },
    { enabled: !!storeId, staleTime: 30 * 1000 }
  );

  // Transform API response to UI format
  // TODO: Backend should add capacity, currentSessionId, currentOrderTotal to TableResponseDto
  const tables: TableWithStatus[] = (response?.data ?? []).map((table) => ({
    id: table.id,
    tableNumber: table.name,
    capacity: 4, // Default capacity until backend provides this
    status: mapApiStatusToUIStatus(table.currentStatus),
    currentSessionId: null, // TODO: Backend to provide active session ID
    currentOrderTotal: undefined, // TODO: Backend to provide order total
  }));

  const handleTableSelect = (tableId: string) => {
    const table = tables.find((tbl) => tbl.id === tableId);
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
