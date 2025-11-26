'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@repo/ui/components/badge';
import { cn } from '@repo/ui/lib/utils';

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface TableStatusBadgeProps {
  status: TableStatus;
  className?: string;
}

const statusStyles: Record<TableStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  OCCUPIED: 'bg-red-100 text-red-800 border-red-200',
  RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CLEANING: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
  const t = useTranslations('sales.tableStatus');

  const translationKeys: Record<TableStatus, string> = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    CLEANING: 'cleaning',
  };

  const style = statusStyles[status] || statusStyles.AVAILABLE;
  const label = t(translationKeys[status] || 'available');

  return (
    <Badge className={cn('text-xs', style, className)} variant="outline">
      {label}
    </Badge>
  );
}
