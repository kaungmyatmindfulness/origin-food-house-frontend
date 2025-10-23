'use client';

import React, { useState } from 'react';
import { Badge } from '@repo/ui/components/badge';

import { selectOrdersByStatus, useKitchenStore } from '../store/kitchen.store';
import type { Order, OrderStatus } from '../types/kitchen.types';
import { OrderActions } from './OrderActions';
import { OrderCard } from './OrderCard';

interface OrderGridProps {
  storeId: string;
}

/**
 * OrderGrid Component
 * Displays orders in Kanban-style columns by status
 */
export function OrderGrid({ storeId }: OrderGridProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const columns: Array<{
    status: OrderStatus;
    title: string;
    bgColor: string;
  }> = [
    {
      status: 'PENDING' as OrderStatus,
      title: 'Pending',
      bgColor: 'bg-orange-50',
    },
    {
      status: 'PREPARING' as OrderStatus,
      title: 'Preparing',
      bgColor: 'bg-blue-50',
    },
    {
      status: 'READY' as OrderStatus,
      title: 'Ready',
      bgColor: 'bg-green-50',
    },
  ];

  const handleOrderSelect = (order: Order) => {
    setSelectedOrderId(order.id === selectedOrderId ? null : order.id);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => (
        <OrderColumn
          key={column.status}
          status={column.status}
          title={column.title}
          bgColor={column.bgColor}
          storeId={storeId}
          selectedOrderId={selectedOrderId}
          onOrderSelect={handleOrderSelect}
        />
      ))}
    </div>
  );
}

/**
 * OrderColumn Component
 * Single column in the Kanban board
 */
interface OrderColumnProps {
  status: OrderStatus;
  title: string;
  bgColor: string;
  storeId: string;
  selectedOrderId: string | null;
  onOrderSelect: (order: Order) => void;
}

function OrderColumn({
  status,
  title,
  bgColor,
  storeId,
  selectedOrderId,
  onOrderSelect,
}: OrderColumnProps) {
  const orders = useKitchenStore((state) =>
    selectOrdersByStatus(state, status)
  );

  return (
    <div className={`rounded-lg p-4 ${bgColor}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <EmptyState status={status} />
        ) : (
          orders.map((order) => (
            <div key={order.id} className="space-y-2">
              <OrderCard
                order={order}
                onSelect={onOrderSelect}
                isSelected={selectedOrderId === order.id}
              />
              {selectedOrderId === order.id && (
                <OrderActions
                  orderId={order.id}
                  currentStatus={order.status}
                  storeId={storeId}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * EmptyState Component
 * Shown when a column has no orders
 */
function EmptyState({ status }: { status: OrderStatus }) {
  const messages: Record<OrderStatus, string> = {
    PENDING: 'No pending orders',
    PREPARING: 'No orders in preparation',
    READY: 'No orders ready',
    SERVED: 'No served orders',
    COMPLETED: 'No completed orders',
    CANCELLED: 'No cancelled orders',
  };

  return (
    <div className="text-muted-foreground rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm">
      {messages[status]}
    </div>
  );
}
