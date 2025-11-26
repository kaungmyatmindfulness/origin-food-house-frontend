'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

import { Card, CardContent } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';

import { TableStatusBadge } from './TableStatusBadge';
import { formatCurrency } from '@/utils/formatting';

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface TableCardProps {
  table: {
    id: string;
    tableNumber: string;
    capacity: number;
    status: TableStatus;
    currentSessionId?: string | null;
    currentOrderTotal?: number;
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
  const hasOrder = table.currentOrderTotal && table.currentOrderTotal > 0;

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
          <div>
            <h3 className="text-foreground text-2xl font-bold">
              {table.tableNumber}
            </h3>
            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              <span>
                {table.capacity} {t('seats')}
              </span>
            </div>
          </div>
          <TableStatusBadge status={table.status} />
        </div>

        {/* Current order info (if occupied) */}
        {hasOrder && (
          <div className="border-t pt-3">
            <p className="text-muted-foreground text-xs">{t('currentOrder')}</p>
            <p className="text-primary text-lg font-bold">
              {formatCurrency(table.currentOrderTotal)}
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
