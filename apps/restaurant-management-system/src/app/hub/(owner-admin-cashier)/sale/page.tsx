'use client';

import { useTranslations } from 'next-intl';
import { Store, UtensilsCrossed } from 'lucide-react';

import { Card, CardContent } from '@repo/ui/components/card';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';

import { QuickSaleView } from '@/features/sales/components/QuickSaleView';
import { TableSaleView } from '@/features/sales/components/TableSaleView';
import { useSalesStore } from '@/features/sales/store/sales.store';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { useAutoPrint } from '@/features/print/hooks/useAutoPrint';
import { SocketProvider } from '@/utils/socket-provider';

import type { SalesView } from '@/features/sales/types/sales.types';

/**
 * Sales page wrapper that provides SocketProvider for real-time features.
 * The SocketProvider enables auto-print functionality for kitchen tickets.
 */
export default function SalesPage() {
  return (
    <SocketProvider>
      <SalesPageContent />
    </SocketProvider>
  );
}

/**
 * Main sales page content component.
 *
 * This component serves as a thin orchestrator that:
 * 1. Handles the header with view toggle tabs
 * 2. Delegates to QuickSaleView or TableSaleView based on active mode
 *
 * Each view component is self-contained with its own:
 * - Cart management (local for quick sale, server-synced for tables)
 * - Dialog handling (QuickAddDialog, CartRecoveryDialog)
 * - Panel rendering (Cart, Payment, Receipt)
 */
function SalesPageContent() {
  const t = useTranslations('sales');

  // Auth store - get selected store
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  // Enable auto-print for kitchen tickets when orders are created via socket
  useAutoPrint({ storeId: selectedStoreId ?? '', enabled: !!selectedStoreId });

  // Sales store - view mode
  const activeView = useSalesStore((state) => state.activeView);
  const setActiveView = useSalesStore((state) => state.setActiveView);

  const handleViewChange = (value: string) => {
    setActiveView(value as SalesView);
  };

  // If no store selected, show message
  if (!selectedStoreId) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('noStoreSelected')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header with view toggle */}
      <header className="border-border bg-background sticky top-0 z-10 border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Page title */}
          <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>

          {/* Center: View toggle tabs */}
          <Tabs
            value={activeView}
            onValueChange={handleViewChange}
            className="flex-shrink-0"
          >
            <TabsList>
              <TabsTrigger value="quick-sale" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">{t('quickSale')}</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tables')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Spacer for alignment */}
          <div className="w-64 flex-shrink-0" />
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        {activeView === 'quick-sale' ? (
          <QuickSaleView storeId={selectedStoreId} />
        ) : (
          <TableSaleView storeId={selectedStoreId} />
        )}
      </main>
    </div>
  );
}
