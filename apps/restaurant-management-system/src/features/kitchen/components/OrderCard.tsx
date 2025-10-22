'use client';

import React from 'react';
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
  const timeElapsed = formatDistanceToNow(new Date(order.createdAt));

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{order.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">{order.tableName}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeElapsed}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">
                  {item.quantity}x
                </span>{' '}
                <span>
                  {item.menuItem?.name || `Item #${item.menuItemId || 'N/A'}`}
                </span>
                {item.notes && (
                  <p className="text-xs italic text-muted-foreground">
                    Note: {item.notes}
                  </p>
                )}
                {item.customizations.length > 0 && (
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
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
            <span>Total</span>
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
  const variants: Record<
    OrderStatus,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      label: string;
    }
  > = {
    PENDING: { variant: 'default', label: 'Pending' },
    PREPARING: { variant: 'secondary', label: 'Preparing' },
    READY: { variant: 'outline', label: 'Ready' },
    SERVED: { variant: 'outline', label: 'Served' },
    COMPLETED: { variant: 'outline', label: 'Completed' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  };

  const config = variants[status] || variants.PENDING;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
