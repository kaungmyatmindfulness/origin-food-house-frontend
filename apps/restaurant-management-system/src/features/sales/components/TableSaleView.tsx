'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';

import { TablesView } from './TablesView';
import { MenuPanel } from './MenuPanel';
import { TableSaleCartPanel } from './TableSaleCartPanel';
import { TableOrderPanel } from './TableOrderPanel';
import { QuickAddDialog } from './QuickAddDialog';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPanel } from './ReceiptPanel';

import { useTableSaleCart } from '../hooks';
import { useSalesStore } from '../store/sales.store';
import { salesKeys } from '../queries/sales.keys';
import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { transformOrderToReceiptData } from '../utils/transform-order-to-receipt';

import type { MenuItemResponseDto } from '@repo/api/generated/types';
import type { TableSaleCartCustomization } from '../store/table-sale-cart.store';

interface TableSaleViewProps {
  storeId: string;
}

/**
 * Table Mode states for the right panel
 */
type TableSaleMode =
  | 'tables' // Selecting a table
  | 'cart' // Adding items to local cart (new order)
  | 'order' // Viewing existing order
  | 'adding' // Adding items to existing order
  | 'payment' // Processing payment
  | 'receipt'; // Showing receipt

/**
 * Table Sale View Component
 *
 * Handles table-based ordering with LOCAL cart (order-centric approach).
 * Uses local cart that creates/modifies orders directly.
 *
 * New Order Flow:
 * 1. User selects an available table
 * 2. Session is started for the table
 * 3. Menu panel shows for item selection
 * 4. Items are added to LOCAL cart (instant)
 * 5. "Send to Kitchen" creates order with all items
 *
 * Add to Order Flow:
 * 1. User selects an occupied table
 * 2. Existing order is displayed
 * 3. User clicks "Add More Items"
 * 4. Items are added to LOCAL cart
 * 5. "Send to Kitchen" adds items to existing order
 */
export function TableSaleView({ storeId }: TableSaleViewProps) {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Sales store state
  const activePanel = useSalesStore((state) => state.activePanel);
  const setActivePanel = useSalesStore((state) => state.setActivePanel);
  const currentOrderId = useSalesStore((state) => state.currentOrderId);
  const setCurrentOrder = useSalesStore((state) => state.setCurrentOrder);
  const selectedTableId = useSalesStore((state) => state.selectedTableId);
  const setSelectedTable = useSalesStore((state) => state.setSelectedTable);
  const clearSession = useSalesStore((state) => state.clearSession);
  const setActiveSession = useSalesStore((state) => state.setActiveSession);

  // Quick add dialog state
  const [quickAddItem, setQuickAddItem] = useState<MenuItemResponseDto | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Track the table number for display
  const [selectedTableNumber, setSelectedTableNumber] = useState<string | null>(
    null
  );

  // Local cart hook for table sale
  const {
    items: cartItems,
    addItem: addItemToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setTable,
    setActiveOrder,
    createOrder,
    addItemsToOrder,
    getSubtotal,
    getItemCount,
    isAddingToOrder,
    isLoading: isCartLoading,
    activeOrderId,
  } = useTableSaleCart({ storeId });

  // Determine the current mode based on state
  const getCurrentMode = (): TableSaleMode => {
    if (activePanel === 'payment') return 'payment';
    if (activePanel === 'receipt') return 'receipt';
    if (!selectedTableId) return 'tables';
    if (isAddingToOrder && cartItems.length >= 0) return 'adding';
    if (activeOrderId && !isAddingToOrder) return 'order';
    return 'cart';
  };

  const mode = getCurrentMode();
  const showMenu = mode === 'cart' || mode === 'adding';

  // Fetch order data for payment/receipt panels
  const {
    data: orderResponse,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = $api.useQuery(
    'get',
    API_PATHS.rmsOrder,
    {
      params: {
        path: { orderId: currentOrderId ?? '' },
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

  // Handle retry fetching order
  const handleRetryFetchOrder = () => {
    void refetchOrder();
  };

  // Handle table session start (for available tables)
  const handleTableSessionStart = (
    newSessionId: string,
    tableId: string,
    tableNumber?: string
  ) => {
    setSelectedTable(tableId);
    setActiveSession(newSessionId, 'TABLE');
    setTable(tableId, newSessionId);
    setSelectedTableNumber(tableNumber ?? null);
  };

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItemResponseDto) => {
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      setQuickAddItem(item);
      setIsQuickAddOpen(true);
    } else {
      // Add directly to local cart
      addItemToCart({
        menuItemId: item.id,
        menuItemName: item.name,
        menuItemImage: item.imagePath ?? undefined,
        basePrice: Number(item.basePrice),
        quantity: 1,
        customizations: [],
        notes: undefined,
      });
      toast.success(t('itemAddedToCart'), { description: item.name });
    }
  };

  // Handle adding from quick add dialog
  const handleQuickAddToCart = async (data: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    customizations?: Array<{
      customizationOptionId: string;
      optionName?: string;
      groupName?: string;
      additionalPrice?: number;
    }>;
  }) => {
    if (!quickAddItem) return;

    // Transform customizations to local cart format
    const cartCustomizations: TableSaleCartCustomization[] = (
      data.customizations ?? []
    ).map((c) => ({
      optionId: c.customizationOptionId,
      optionName: c.optionName ?? '',
      groupName: c.groupName ?? '',
      additionalPrice: c.additionalPrice ?? 0,
    }));

    addItemToCart({
      menuItemId: data.menuItemId,
      menuItemName: quickAddItem.name,
      menuItemImage: quickAddItem.imagePath ?? undefined,
      basePrice: Number(quickAddItem.basePrice),
      quantity: data.quantity,
      customizations: cartCustomizations,
      notes: data.notes,
    });

    setIsQuickAddOpen(false);
    setQuickAddItem(null);
    toast.success(t('itemAddedToCart'), { description: quickAddItem.name });
  };

  // Handle send to kitchen (create order or add items)
  const handleSendToKitchen = async () => {
    if (isAddingToOrder) {
      await addItemsToOrder();
    } else {
      await createOrder({ orderType: 'DINE_IN' });
    }
  };

  // Handle adding more items to existing order
  const handleAddMoreItems = () => {
    // Clear cart and set to adding mode
    clearCart();
    if (activeOrderId) {
      setActiveOrder(activeOrderId);
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (activeOrderId) {
      setCurrentOrder(activeOrderId);
      setActivePanel('payment');
    }
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
    clearCart();
    setSelectedTableNumber(null);
    setActivePanel('cart');
  };

  // Render left panel based on session state
  const renderLeftPanel = () => {
    // If we have a selected table and are in cart/adding mode, show the menu
    if (showMenu) {
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
            onTableSessionStart={(newSessionId, tableId) => {
              // For new sessions, we need to get the table number from the tables list
              handleTableSessionStart(newSessionId, tableId);
            }}
          />
        </CardContent>
      </Card>
    );
  };

  // Render right panel based on active state
  const renderRightPanel = () => {
    // Show loading state while creating order or adding items
    if (isCartLoading) {
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

    switch (mode) {
      case 'payment':
        // Error state for order fetch
        if (orderError) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-4">
                    {t('failedToLoadOrder')}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handlePaymentBack}>
                      {t('backToCart')}
                    </Button>
                    <Button onClick={handleRetryFetchOrder}>
                      {t('retry')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (!currentOrderId || isLoadingOrder) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground">{t('loadingPayment')}</p>
                </div>
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
        // Error state for order fetch
        if (orderError) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-4">
                    {t('failedToLoadOrder')}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handleNewOrder}>
                      {t('newOrder')}
                    </Button>
                    <Button onClick={handleRetryFetchOrder}>
                      {t('retry')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (!currentOrderId || !currentOrder || isLoadingOrder) {
          return (
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground">{t('loadingReceipt')}</p>
                </div>
              </CardContent>
            </Card>
          );
        }
        const receiptOrderData = transformOrderToReceiptData(currentOrder);
        return (
          <ReceiptPanel order={receiptOrderData} onNewOrder={handleNewOrder} />
        );
      }

      case 'order':
        // Show existing order details
        if (activeOrderId) {
          return (
            <TableOrderPanel
              orderId={activeOrderId}
              onAddMoreItems={handleAddMoreItems}
              onProceedToPayment={handleProceedToPayment}
            />
          );
        }
        // Fall through to cart if no order - use explicit return for cart panel
        return (
          <TableSaleCartPanel
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onSendToKitchen={handleSendToKitchen}
            getSubtotal={getSubtotal}
            getItemCount={getItemCount}
            isLoading={isCartLoading}
            isAddingToOrder={isAddingToOrder}
            tableNumber={selectedTableNumber ?? undefined}
          />
        );

      case 'cart':
      case 'adding':
      default:
        return (
          <TableSaleCartPanel
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onSendToKitchen={handleSendToKitchen}
            getSubtotal={getSubtotal}
            getItemCount={getItemCount}
            isLoading={isCartLoading}
            isAddingToOrder={isAddingToOrder}
            tableNumber={selectedTableNumber ?? undefined}
          />
        );
    }
  };

  return (
    <>
      {/* Main content area - 60/40 split */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        {/* Left panel - Tables or Menu (60%) */}
        <div className="min-h-96 min-w-0 flex-1 overflow-hidden lg:flex-[3]">
          {renderLeftPanel()}
        </div>

        {/* Right panel - Cart/Order/Payment/Receipt (40%) */}
        <div className="min-h-96 min-w-0 flex-1 lg:flex-[2]">
          {renderRightPanel()}
        </div>
      </div>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        item={quickAddItem}
        onAddToCart={handleQuickAddToCart}
        isLoading={false}
      />
    </>
  );
}
