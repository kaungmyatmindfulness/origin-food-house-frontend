'use client';

import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@repo/ui/components/button';
import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';

import { salesKeys } from '@/features/sales/queries/sales.keys';

import { OrderCard } from './OrderCard';

import type { OrderResponseDto } from '@repo/api/generated/types';

/**
 * Fetches active orders for a store.
 * Active orders are those with status: PENDING, PREPARING, READY, or SERVED
 *
 * TODO: Implement proper API endpoint - BE developer should implement:
 * GET /stores/{storeId}/orders?status=PENDING,PREPARING,READY,SERVED
 *
 * For now, returns empty array until API is ready.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getActiveOrders(_storeId: string): Promise<OrderResponseDto[]> {
  // NOTE FOR BE DEVELOPER: Implement GET /stores/{storeId}/orders?status=PENDING,PREPARING,READY,SERVED
  // This should return orders that are not COMPLETED or CANCELLED
  return [];
}

interface ActiveOrdersPanelProps {
  storeId: string;
  onOrderSelect: (orderId: string) => void;
  selectedOrderId?: string | null;
}

export function ActiveOrdersPanel({
  storeId,
  onOrderSelect,
  selectedOrderId,
}: ActiveOrdersPanelProps) {
  const t = useTranslations('sales');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    data: orders,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: salesKeys.activeOrders(storeId),
    queryFn: () => getActiveOrders(storeId),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const activeOrders = orders ?? [];

  if (isCollapsed) {
    return (
      <div className="border-border bg-background border-t px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          onClick={() => setIsCollapsed(false)}
        >
          <span className="flex items-center gap-2">
            {t('activeOrders')}
            {activeOrders.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {activeOrders.length}
              </span>
            )}
          </span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border bg-background border-t">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-medium">
            {t('activeOrders')}
          </h3>
          {activeOrders.length > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeOrders.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw
              className={cn('h-5 w-5', isRefetching && 'animate-spin')}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Orders list */}
      <div className="px-4 pb-3">
        {isLoading ? (
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-48 flex-shrink-0" />
            ))}
          </div>
        ) : activeOrders.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">
            {t('noActiveOrders')}
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSelect={onOrderSelect}
                  isSelected={selectedOrderId === order.id}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
