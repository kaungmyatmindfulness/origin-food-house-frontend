'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

import { Card, CardContent } from '@repo/ui/components/card';

import { TablesView } from './TablesView';
import { MenuPanel } from './MenuPanel';
import { CartPanel } from './CartPanel';
import { QuickAddDialog } from './QuickAddDialog';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPanel } from './ReceiptPanel';

import { useSalesCart } from '../hooks';
import { useSalesStore } from '../store/sales.store';
import { salesKeys } from '../queries/sales.keys';
import { $api } from '@/utils/apiFetch';
import { transformOrderToReceiptData } from '../utils/transform-order-to-receipt';

import type { MenuItemResponseDto } from '@repo/api/generated/types';

interface TableSaleViewProps {
  storeId: string;
}

/**
 * Table Sale View Component
 *
 * Handles table-based ordering with table selection.
 * Uses server-synced cart for real-time updates across devices.
 *
 * Flow:
 * 1. User selects a table or starts a session
 * 2. Menu panel shows for item selection
 * 3. Items are added to server cart (synced in real-time)
 * 4. Checkout creates an order
 * 5. Payment is processed
 * 6. Receipt is displayed
 */
export function TableSaleView({ storeId }: TableSaleViewProps) {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Sales store state
  const activePanel = useSalesStore((state) => state.activePanel);
  const setActivePanel = useSalesStore((state) => state.setActivePanel);
  const currentOrderId = useSalesStore((state) => state.currentOrderId);
  const setCurrentOrder = useSalesStore((state) => state.setCurrentOrder);
  const setActiveSession = useSalesStore((state) => state.setActiveSession);
  const setSelectedTable = useSalesStore((state) => state.setSelectedTable);
  const clearSession = useSalesStore((state) => state.clearSession);

  // Quick add dialog state
  const [quickAddItem, setQuickAddItem] = useState<MenuItemResponseDto | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Server cart hook
  const {
    addItem: addItemToServerCart,
    isLoading: isAddingToServerCart,
    activeSessionId,
  } = useSalesCart({ storeId });

  // Checkout mutation
  const checkoutMutation = $api.useMutation('post', '/orders/checkout', {
    onSuccess: (response) => {
      const order = response.data;
      if (order) {
        setCurrentOrder(order.id);
        setActivePanel('payment');
        queryClient.invalidateQueries({
          queryKey: salesKeys.cart(activeSessionId ?? ''),
        });
        toast.success(t('checkoutSuccessful'));
      }
    },
    onError: (error: unknown) => {
      toast.error(t('checkoutFailed'), {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  // Fetch order data for payment/receipt panels
  const { data: orderResponse, isLoading: isLoadingOrder } = $api.useQuery(
    'get',
    '/orders/{orderId}',
    {
      params: {
        path: { orderId: currentOrderId ?? '', id: currentOrderId ?? '' },
      },
    },
    {
      enabled:
        !!currentOrderId &&
        (activePanel === 'payment' || activePanel === 'receipt'),
      staleTime: 30 * 1000,
    }
  );

  const currentOrder = orderResponse?.data ?? null;

  // Handle table session start
  const handleTableSessionStart = (sessionId: string, tableId: string) => {
    setSelectedTable(tableId);
    setActiveSession(sessionId, 'TABLE');
  };

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItemResponseDto) => {
    if (item.customizationGroups?.length) {
      setQuickAddItem(item);
      setIsQuickAddOpen(true);
    } else {
      addItemToServerCart({
        menuItemId: item.id,
        quantity: 1,
      });
    }
  };

  // Handle adding from quick add dialog
  const handleQuickAddToCart = async (data: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    customizations?: Array<{ customizationOptionId: string }>;
  }) => {
    addItemToServerCart({
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      notes: data.notes,
      customizations: data.customizations,
    });
    setIsQuickAddOpen(false);
    setQuickAddItem(null);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!activeSessionId) {
      toast.error(t('noActiveSession'));
      return;
    }
    checkoutMutation.mutate({
      params: { query: { sessionId: activeSessionId } },
      body: { orderType: 'DINE_IN' },
    });
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setActivePanel('receipt');
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

  // Render left panel based on session state
  const renderLeftPanel = () => {
    // If we have an active session, show the menu
    if (activeSessionId) {
      return (
        <Card className="h-full overflow-hidden">
          <CardContent className="h-full p-4">
            <MenuPanel storeId={storeId} onAddToCart={handleMenuItemClick} />
          </CardContent>
        </Card>
      );
    }

    // Otherwise show tables view for selection
    return (
      <Card className="h-full overflow-hidden">
        <CardContent className="h-full p-4">
          <TablesView
            storeId={storeId}
            onTableSessionStart={handleTableSessionStart}
          />
        </CardContent>
      </Card>
    );
  };

  // Render right panel based on active state
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
        const receiptOrderData = transformOrderToReceiptData(currentOrder);
        return (
          <ReceiptPanel order={receiptOrderData} onNewOrder={handleNewOrder} />
        );
      }

      case 'cart':
      default:
        return (
          <CartPanel sessionId={activeSessionId} onCheckout={handleCheckout} />
        );
    }
  };

  return (
    <>
      {/* Main content area - 60/40 split */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        {/* Left panel - Tables or Menu (60%) */}
        <div className="min-h-[400px] min-w-0 flex-1 overflow-hidden lg:flex-[3]">
          {renderLeftPanel()}
        </div>

        {/* Right panel - Cart/Payment/Receipt (40%) */}
        <div className="min-h-[400px] min-w-0 flex-1 lg:flex-[2]">
          {renderRightPanel()}
        </div>
      </div>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        item={quickAddItem}
        onAddToCart={handleQuickAddToCart}
        isLoading={isAddingToServerCart}
      />
    </>
  );
}
