'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';

import { TableStatusBadge } from './TableStatusBadge';
import { formatCurrency } from '@/utils/formatting';

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface TableCardProps {
  table: {
    id: string;
    tableNumber: string;
    status: TableStatus;
    currentSessionId?: string | null;
    currentOrderTotal?: string | null;
  };
  onSelect: (tableId: string) => void;
  isSelected?: boolean;
}

export function TableCard({
  table,
  onSelect,
  isSelected = false,
}: TableCardProps) {
  const t = useTranslations('sales');

  const isAvailable = table.status === 'AVAILABLE';
  const orderTotal = table.currentOrderTotal
    ? parseFloat(table.currentOrderTotal)
    : 0;
  const hasOrder = orderTotal > 0;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-primary ring-2',
        !isAvailable && 'opacity-75'
      )}
      onClick={() => onSelect(table.id)}
    >
      <CardContent className="p-4">
        {/* Table number and status */}
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-foreground text-2xl font-bold">
            {table.tableNumber}
          </h3>
          <TableStatusBadge status={table.status} />
        </div>

        {/* Current order info (if occupied) */}
        {hasOrder && (
          <div className="border-t pt-3">
            <p className="text-muted-foreground text-xs">{t('currentOrder')}</p>
            <p className="text-primary text-lg font-bold">
              {formatCurrency(orderTotal)}
            </p>
          </div>
        )}

        {/* Available indicator */}
        {isAvailable && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium text-green-600">
              {t('tapToStartOrder')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
