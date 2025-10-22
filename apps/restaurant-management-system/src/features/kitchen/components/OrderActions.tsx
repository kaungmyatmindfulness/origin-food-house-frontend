'use client';

import React from 'react';
import { Button } from '@repo/ui/components/button';
import { ChefHat, Check } from 'lucide-react';

import type { OrderStatus } from '../types/kitchen.types';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  storeId: string;
}

/**
 * OrderActions Component
 * Displays action buttons for order status transitions
 *
 * Status Flow:
 * PENDING → PREPARING → READY → SERVED → COMPLETED
 */
export function OrderActions({
  orderId,
  currentStatus,
  storeId,
}: OrderActionsProps) {
  const updateMutation = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateMutation.mutate({
      orderId,
      status: newStatus,
      storeId,
    });
  };

  // Determine next available actions based on current status
  const actions = getAvailableActions(currentStatus);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          size="sm"
          onClick={() => handleStatusChange(action.status)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2"
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

/**
 * Configuration for action buttons
 */
interface ActionConfig {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'outline' | 'secondary';
}

/**
 * Returns available actions for a given order status
 */
function getAvailableActions(currentStatus: OrderStatus): ActionConfig[] {
  const actionMap: Record<OrderStatus, ActionConfig[]> = {
    PENDING: [
      {
        status: 'PREPARING' as OrderStatus,
        label: 'Start Preparing',
        icon: <ChefHat className="h-4 w-4" />,
        variant: 'default',
      },
    ],
    PREPARING: [
      {
        status: 'READY' as OrderStatus,
        label: 'Mark Ready',
        icon: <Check className="h-4 w-4" />,
        variant: 'default',
      },
    ],
    READY: [
      {
        status: 'SERVED' as OrderStatus,
        label: 'Mark Served',
        icon: <Check className="h-4 w-4" />,
        variant: 'secondary',
      },
    ],
    SERVED: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  return actionMap[currentStatus] || [];
}
