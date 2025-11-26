'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardHeader } from '@repo/ui/components/card';
import { Clock, Phone, ShoppingBag, Store, User } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

import { formatDistanceToNow } from '@/utils/formatting';
import { getSessionTypeInfo } from '@/features/sales/utils/session-type.utils';

import type { Order, OrderStatus, SessionType } from '../types/kitchen.types';

interface OrderCardProps {
  order: Order;
  onSelect?: (order: Order) => void;
  isSelected?: boolean;
}

/**
 * OrderCard Component
 * Displays a single order with items, time elapsed, and status badge
 */
export function OrderCard({ order, onSelect, isSelected }: OrderCardProps) {
  const t = useTranslations('kitchen.order');
  const timeElapsed = formatDistanceToNow(new Date(order.createdAt));
  const sessionInfo = getSessionTypeInfo(order.session, order.tableName);
  // Cast to kitchen's SessionType enum (compatible string values)
  const sessionType = sessionInfo.sessionType as SessionType | null;
  const isQuickSale = sessionInfo.isQuickSale;
  const customerName = order.session?.customerName;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-primary ring-2' : ''
      }`}
      onClick={() => onSelect?.(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">{order.orderNumber}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isQuickSale && sessionType ? (
                <SessionTypeBadge sessionType={sessionType} />
              ) : (
                <span className="text-muted-foreground text-sm">
                  {order.tableName}
                </span>
              )}
              {customerName && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <User className="h-3 w-3" />
                  {customerName}
                </span>
              )}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <Clock className="h-4 w-4" />
          <span>{timeElapsed}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x</span>{' '}
                <span>
                  {item.menuItem?.name || `Item #${item.menuItemId || 'N/A'}`}
                </span>
                {item.notes && (
                  <p className="text-muted-foreground text-xs italic">
                    {t('note')}: {item.notes}
                  </p>
                )}
                {item.customizations.length > 0 && (
                  <ul className="text-muted-foreground mt-1 ml-4 list-disc text-xs">
                    {item.customizations.map((custom) => (
                      <li key={custom.id}>
                        {custom.customizationOption?.name ||
                          `Option #${custom.customizationOptionId}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t pt-3">
          <div className="flex justify-between text-sm font-medium">
            <span>{t('total')}</span>
            <span>฿{parseFloat(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * OrderStatusBadge Component
 * Displays a colored badge for order status
 */
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('kitchen.status');

  const variants: Record<
    OrderStatus,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      labelKey:
        | 'pending'
        | 'preparing'
        | 'ready'
        | 'served'
        | 'completed'
        | 'cancelled';
    }
  > = {
    PENDING: { variant: 'default', labelKey: 'pending' },
    PREPARING: { variant: 'secondary', labelKey: 'preparing' },
    READY: { variant: 'outline', labelKey: 'ready' },
    SERVED: { variant: 'outline', labelKey: 'served' },
    COMPLETED: { variant: 'outline', labelKey: 'completed' },
    CANCELLED: { variant: 'destructive', labelKey: 'cancelled' },
  };

  const config = variants[status] || variants.PENDING;

  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}

/**
 * Session type style configuration
 * Color coding: Counter (blue), Phone (green), Takeout (orange)
 */
interface SessionTypeStyle {
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
}

const sessionTypeStyles: Record<SessionType, SessionTypeStyle> = {
  TABLE: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    icon: Store,
  },
  COUNTER: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Store,
  },
  PHONE: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
    icon: Phone,
  },
  TAKEOUT: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800',
    icon: ShoppingBag,
  },
};

/**
 * SessionTypeBadge Component
 * Displays a colored badge indicating the order source type
 */
function SessionTypeBadge({ sessionType }: { sessionType: SessionType }) {
  const t = useTranslations('kitchen.sessionType');

  const style = sessionTypeStyles[sessionType] || sessionTypeStyles.COUNTER;
  const Icon = style.icon;

  const labelMap: Record<SessionType, string> = {
    TABLE: 'table',
    COUNTER: 'counter',
    PHONE: 'phone',
    TAKEOUT: 'takeout',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border
      )}
    >
      <Icon className="h-3 w-3" />
      {t(labelMap[sessionType])}
    </span>
  );
}
