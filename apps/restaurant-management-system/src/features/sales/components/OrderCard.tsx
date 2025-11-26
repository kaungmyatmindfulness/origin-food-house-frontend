'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';

import { formatCurrency, formatDistanceToNow } from '@/utils/formatting';

import type { OrderResponseDto } from '@repo/api/generated/types';

interface OrderCardProps {
  order: OrderResponseDto;
  onSelect: (orderId: string) => void;
  isSelected?: boolean;
}

interface StatusStyle {
  bg: string;
  text: string;
  border: string;
}

/**
 * Default status style for unknown statuses
 */
const DEFAULT_STATUS_STYLE: StatusStyle = {
  bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  text: 'text-yellow-800 dark:text-yellow-200',
  border: 'border-yellow-200 dark:border-yellow-800',
};

/**
 * Status color mapping using semantic Tailwind classes
 * These use custom utility classes that align with the design system
 */
const statusColors: Record<string, StatusStyle> = {
  PENDING: DEFAULT_STATUS_STYLE,
  PREPARING: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800',
  },
  READY: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
  },
  SERVED: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
  },
  COMPLETED: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
  CANCELLED: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
  },
};

export function OrderCard({
  order,
  onSelect,
  isSelected = false,
}: OrderCardProps) {
  const t = useTranslations('sales');

  const orderNumber =
    order.orderNumber || `#${order.id.substring(0, 6).toUpperCase()}`;
  const status = order.status || 'PENDING';
  const createdAt = new Date(order.createdAt);
  const timeAgo = formatDistanceToNow(createdAt);
  const itemCount = order.orderItems?.length ?? 0;

  const statusStyle = statusColors[status] ?? DEFAULT_STATUS_STYLE;

  return (
    <Card
      className={cn(
        'hover:bg-accent/50 w-48 flex-shrink-0 cursor-pointer p-3 transition-all hover:shadow-md',
        isSelected && 'ring-primary ring-2'
      )}
      onClick={() => onSelect(order.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground truncate font-semibold">
            {orderNumber}
          </p>
          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium',
            statusStyle.bg,
            statusStyle.text,
            statusStyle.border
          )}
        >
          {t(`orderStatus.${status.toLowerCase()}`)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {itemCount} {itemCount === 1 ? t('item') : t('items')}
        </span>
        <span className="text-primary font-bold">
          {formatCurrency(order.grandTotal)}
        </span>
      </div>
    </Card>
  );
}
