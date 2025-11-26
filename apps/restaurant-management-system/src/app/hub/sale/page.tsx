'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';

import { Card, CardContent } from '@repo/ui/components/card';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';

import {
  MenuPanel,
  CartPanel,
  CartRecoveryDialog,
  QuickAddDialog,
  QuickSaleCartPanel,
  TablesView,
  PaymentPanel,
  ReceiptPanel,
} from '@/features/sales/components';
import { useQuickSaleCartStore } from '@/features/sales/store/quick-sale-cart.store';
import { useSalesCart, useQuickSaleCart } from '@/features/sales/hooks';
import { useSalesStore } from '@/features/sales/store/sales.store';
import { salesKeys } from '@/features/sales/queries/sales.keys';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  checkoutCart,
  getOrder,
} from '@/features/orders/services/order.service';
import { transformOrderToReceiptData } from '@/features/sales/utils/transform-order-to-receipt';

import type {
  SalesMenuItem,
  SalesView,
} from '@/features/sales/types/sales.types';

export default function SalesPage() {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Auth store - get selected store
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  // Sales store
  const activeView = useSalesStore((state) => state.activeView);
  const setActiveView = useSalesStore((state) => state.setActiveView);
  const activePanel = useSalesStore((state) => state.activePanel);
  const setActivePanel = useSalesStore((state) => state.setActivePanel);
  const currentOrderId = useSalesStore((state) => state.currentOrderId);
  const setCurrentOrder = useSalesStore((state) => state.setCurrentOrder);
  const setActiveSession = useSalesStore((state) => state.setActiveSession);
  const setSelectedTable = useSalesStore((state) => state.setSelectedTable);
  const clearSession = useSalesStore((state) => state.clearSession);

  // Quick add dialog state
  const [quickAddItem, setQuickAddItem] = useState<SalesMenuItem | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Cart recovery dialog state
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const quickSaleItems = useQuickSaleCartStore((state) => state.items);
  const clearQuickSaleCart = useQuickSaleCartStore((state) => state.clearCart);

  // Track if we've already checked for cart recovery (prevents showing dialog on every render)
  const hasCheckedCartRecovery = useRef(false);

  // Check for existing cart items on mount (only once)
  useEffect(() => {
    // Only check once on mount
    if (hasCheckedCartRecovery.current) return;
    hasCheckedCartRecovery.current = true;

    // Only show recovery dialog on quick-sale mode with existing items
    if (activeView === 'quick-sale' && quickSaleItems.length > 0) {
      setIsRecoveryDialogOpen(true);
    }
  }, [activeView, quickSaleItems.length]);

  // Cart hook for table-based orders
  const {
    addItem: addItemToServerCart,
    isLoading: isAddingToServerCart,
    activeSessionId,
  } = useSalesCart({
    storeId: selectedStoreId ?? '',
  });

  // Quick sale cart hook for localStorage-based cart
  const { addItem: addItemToLocalCart } = useQuickSaleCart({
    storeId: selectedStoreId ?? '',
  });

  // Determine which cart to use based on active view
  const isQuickSaleMode = activeView === 'quick-sale';
  const isAddingToCart = isQuickSaleMode
    ? false // Local cart is instant
    : isAddingToServerCart;

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (sessionId: string) => checkoutCart(sessionId),
    onSuccess: (order) => {
      setCurrentOrder(order.id);
      setActivePanel('payment');
      // Invalidate cart query since we've checked out
      queryClient.invalidateQueries({
        queryKey: salesKeys.cart(activeSessionId ?? ''),
      });
      toast.success(t('checkoutSuccessful'));
    },
    onError: (error) => {
      toast.error(t('checkoutFailed'), {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  // Fetch order data when we have a currentOrderId (for PaymentPanel and ReceiptPanel)
  const { data: currentOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: salesKeys.order(currentOrderId ?? ''),
    queryFn: () => getOrder(currentOrderId!),
    enabled:
      !!currentOrderId &&
      (activePanel === 'payment' || activePanel === 'receipt'),
    staleTime: 30 * 1000,
  });

  const handleViewChange = (value: string) => {
    setActiveView(value as SalesView);
  };

  // When user clicks an item in the menu grid
  const handleMenuItemClick = (item: SalesMenuItem) => {
    // Check if item has customizations - if so, show dialog
    if (item.customizationGroups?.length) {
      setQuickAddItem(item);
      setIsQuickAddOpen(true);
    } else {
      // No customizations - add directly based on mode
      if (isQuickSaleMode) {
        addItemToLocalCart({
          menuItemId: item.id,
          menuItemName: item.name,
          menuItemImage: item.imagePath ?? undefined,
          basePrice: Number(item.basePrice),
          quantity: 1,
        });
      } else {
        addItemToServerCart({
          menuItemId: item.id,
          quantity: 1,
        });
      }
    }
  };

  // Handle adding from quick add dialog
  const handleQuickAddToCart = async (data: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    customizations?: Array<{ customizationOptionId: string }>;
  }) => {
    if (isQuickSaleMode && quickAddItem) {
      // For quick sale, we need item details for local storage
      // Convert customizations to include option details from the item
      const customizationsWithDetails = data.customizations?.map((c) => {
        // Find the option in the item's customization groups
        for (const group of quickAddItem.customizationGroups ?? []) {
          const option = group.customizationOptions.find(
            (o: { id: string }) => o.id === c.customizationOptionId
          );
          if (option) {
            return {
              optionId: option.id,
              optionName: option.name,
              groupName: group.name,
              additionalPrice: Number(option.additionalPrice ?? 0),
            };
          }
        }
        return {
          optionId: c.customizationOptionId,
          optionName: 'Unknown',
          groupName: 'Unknown',
          additionalPrice: 0,
        };
      });

      addItemToLocalCart({
        menuItemId: data.menuItemId,
        menuItemName: quickAddItem.name,
        menuItemImage: quickAddItem.imagePath ?? undefined,
        basePrice: Number(quickAddItem.basePrice),
        quantity: data.quantity,
        notes: data.notes,
        customizations: customizationsWithDetails,
      });
    } else {
      // For server cart, just pass the IDs
      addItemToServerCart({
        menuItemId: data.menuItemId,
        quantity: data.quantity,
        notes: data.notes,
        customizations: data.customizations,
      });
    }
    setIsQuickAddOpen(false);
    setQuickAddItem(null);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!activeSessionId) {
      toast.error(t('noActiveSession'));
      return;
    }
    checkoutMutation.mutate(activeSessionId);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setActivePanel('receipt');
    // Refetch order to get updated payment info
    if (currentOrderId) {
      queryClient.invalidateQueries({
        queryKey: salesKeys.order(currentOrderId),
      });
    }
  };

  // Handle back from payment
  const handlePaymentBack = () => {
    setActivePanel('cart');
  };

  // Handle new order (after receipt)
  const handleNewOrder = () => {
    clearSession();
    setActivePanel('cart');
  };

  // Handle table session start (tableId used by TablesView callback signature)
  const handleTableSessionStart = (sessionId: string, tableId: string) => {
    setSelectedTable(tableId);
    setActiveSession(sessionId, 'TABLE');
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

  // Render the right sidebar panel based on activePanel state
  const renderRightPanel = () => {
    // Show loading state while checking out
    if (checkoutMutation.isPending) {
      return (
        <Card className="flex h-full flex-col">
          <CardContent className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2 className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
              <p className="text-muted-foreground">{t('processing')}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activePanel) {
      case 'payment':
        if (!currentOrderId || isLoadingOrder) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          );
        }
        return (
          <PaymentPanel
            orderId={currentOrderId}
            orderTotal={currentOrder ? Number(currentOrder.grandTotal) : 0}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={handlePaymentBack}
          />
        );

      case 'receipt': {
        if (!currentOrderId || !currentOrder || isLoadingOrder) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          );
        }
        // Transform order data for ReceiptPanel using utility function
        const receiptOrderData = transformOrderToReceiptData(currentOrder);
        return (
          <ReceiptPanel order={receiptOrderData} onNewOrder={handleNewOrder} />
        );
      }

      case 'cart':
      default:
        // Use QuickSaleCartPanel for quick-sale mode, CartPanel for table mode
        if (isQuickSaleMode) {
          return <QuickSaleCartPanel storeId={selectedStoreId} />;
        }
        return (
          <CartPanel sessionId={activeSessionId} onCheckout={handleCheckout} />
        );
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
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

      {/* Main content area - 60/40 split on desktop, stacked on mobile */}
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        {/* Left panel - Menu or Tables (60%) */}
        <div className="min-h-[400px] min-w-0 flex-1 overflow-hidden lg:flex-[3]">
          {activeView === 'quick-sale' ? (
            <Card className="h-full overflow-hidden">
              <CardContent className="h-full p-4">
                <MenuPanel
                  storeId={selectedStoreId}
                  onAddToCart={handleMenuItemClick}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full overflow-hidden">
              <CardContent className="h-full p-4">
                <TablesView
                  storeId={selectedStoreId}
                  onTableSessionStart={handleTableSessionStart}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel - Cart/Payment/Receipt (40%) */}
        <div className="min-h-[400px] min-w-0 flex-1 lg:flex-[2]">
          {renderRightPanel()}
        </div>
      </main>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        item={quickAddItem}
        onAddToCart={handleQuickAddToCart}
        isLoading={isAddingToCart}
      />

      {/* Cart Recovery Dialog */}
      <CartRecoveryDialog
        open={isRecoveryDialogOpen}
        onOpenChange={setIsRecoveryDialogOpen}
        onContinue={() => {
          // Just close the dialog - cart items are already there
          setIsRecoveryDialogOpen(false);
        }}
        onStartFresh={() => {
          clearQuickSaleCart();
          setIsRecoveryDialogOpen(false);
        }}
      />
    </div>
  );
}
