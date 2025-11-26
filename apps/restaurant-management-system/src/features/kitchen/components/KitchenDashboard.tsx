'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Bell, BellOff, RefreshCw } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/auth.store';

import { useKdsOrders } from '../hooks/useKdsOrders';
import { useKitchenSocket } from '../hooks/useKitchenSocket';
import {
  selectAutoRefresh,
  selectRefreshInterval,
  selectSoundEnabled,
  useKitchenStore,
} from '../store/kitchen.store';
import { KitchenStats } from './KitchenStats';
import { OrderGrid } from './OrderGrid';

/**
 * KitchenDashboard Component
 * Main dashboard for Kitchen Display System (KDS)
 *
 * Features:
 * - Real-time order updates via WebSocket
 * - Auto-refresh with configurable interval
 * - Sound notifications
 * - Kanban-style order grid
 * - Kitchen statistics
 */
export default function KitchenDashboard() {
  const t = useTranslations('kitchen');
  const storeId = useAuthStore((state) => state.selectedStoreId);
  const autoRefresh = useKitchenStore(selectAutoRefresh);
  const refreshInterval = useKitchenStore(selectRefreshInterval);
  const soundEnabled = useKitchenStore(selectSoundEnabled);
  const toggleSound = useKitchenStore((state) => state.toggleSound);
  const setOrders = useKitchenStore((state) => state.setOrders);

  // Fetch orders with auto-refresh
  const { data, isLoading, error, refetch } = useKdsOrders(
    {
      storeId: storeId || '',
      // Only show active orders (PENDING, PREPARING, READY)
      page: 1,
      limit: 100,
    },
    {
      enabled: !!storeId,
      refetchInterval: autoRefresh ? refreshInterval * 1000 : undefined,
    }
  );

  // Set up WebSocket for real-time updates
  useKitchenSocket(storeId);

  // Sync fetched orders to store
  useEffect(() => {
    if (data?.items) {
      setOrders(data.items);
    }
  }, [data, setOrders]);

  if (!storeId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('selectStore')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{t('loadFailed')}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={toggleSound}
            title={soundEnabled ? t('disableSound') : t('enableSound')}
          >
            {soundEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={() => refetch()}
            title={t('refresh')}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {isLoading ? <StatsSkeleton /> : <KitchenStats />}

      {/* Order Grid */}
      {isLoading ? <GridSkeleton /> : <OrderGrid storeId={storeId} />}
    </div>
  );
}

/**
 * Loading skeleton for statistics
 */
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for order grid
 */
function GridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
    </div>
  );
}
