'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardHeader } from '@repo/ui/components/card';
import { Clock } from 'lucide-react';

import { formatDistanceToNow } from '@/utils/formatting';

import type { Order, OrderStatus } from '../types/kitchen.types';

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

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-primary ring-2' : ''
      }`}
      onClick={() => onSelect?.(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{order.orderNumber}</h3>
            <p className="text-muted-foreground text-sm">{order.tableName}</p>
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
