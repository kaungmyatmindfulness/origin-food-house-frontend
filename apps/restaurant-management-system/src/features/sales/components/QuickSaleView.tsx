'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardContent } from '@repo/ui/components/card';

import { MenuPanel } from './MenuPanel';
import { QuickSaleCartPanel } from './QuickSaleCartPanel';
import { QuickAddDialog } from './QuickAddDialog';
import { CartRecoveryDialog } from './CartRecoveryDialog';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPanel } from './ReceiptPanel';

import { useQuickSaleCart } from '../hooks';
import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';
import { useSalesStore } from '../store/sales.store';
import { salesKeys } from '../queries/sales.keys';
import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { transformOrderToReceiptData } from '../utils/transform-order-to-receipt';

import type { MenuItemResponseDto } from '@repo/api/generated/types';

interface QuickSaleViewProps {
  storeId: string;
}

/**
 * Quick Sale View Component
 *
 * Handles counter/takeout ordering without table assignment.
 * Uses localStorage-based cart for instant UI updates.
 *
 * Flow:
 * 1. User adds items to local cart (instant feedback)
 * 2. On checkout, cart is synced to backend and order is created
 * 3. Payment is processed
 * 4. Receipt is displayed
 */
export function QuickSaleView({ storeId }: QuickSaleViewProps) {
  const queryClient = useQueryClient();

  // Sales store state
  const activePanel = useSalesStore((state) => state.activePanel);
  const setActivePanel = useSalesStore((state) => state.setActivePanel);
  const currentOrderId = useSalesStore((state) => state.currentOrderId);
  const clearSession = useSalesStore((state) => state.clearSession);

  // Quick sale cart store
  const quickSaleItems = useQuickSaleCartStore((state) => state.items);
  const clearQuickSaleCart = useQuickSaleCartStore((state) => state.clearCart);

  // Quick add dialog state
  const [quickAddItem, setQuickAddItem] = useState<MenuItemResponseDto | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Cart recovery dialog state
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const hasCheckedCartRecovery = useRef(false);

  // Quick sale cart hook
  const { addItem: addItemToLocalCart } = useQuickSaleCart({ storeId });

  // Check for existing cart items on mount (only once)
  useEffect(() => {
    if (hasCheckedCartRecovery.current) return;
    hasCheckedCartRecovery.current = true;

    if (quickSaleItems.length > 0) {
      setIsRecoveryDialogOpen(true);
    }
  }, [quickSaleItems.length]);

  // Fetch order data for payment/receipt panels
  const { data: orderResponse, isLoading: isLoadingOrder } = $api.useQuery(
    'get',
    API_PATHS.order,
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

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItemResponseDto) => {
    if (item.customizationGroups?.length) {
      setQuickAddItem(item);
      setIsQuickAddOpen(true);
    } else {
      addItemToLocalCart({
        menuItemId: item.id,
        menuItemName: item.name,
        menuItemImage: item.imagePath ? String(item.imagePath) : undefined,
        basePrice: Number(item.basePrice),
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
    if (quickAddItem) {
      const customizationsWithDetails = data.customizations?.map((c) => {
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
        menuItemImage: quickAddItem.imagePath
          ? String(quickAddItem.imagePath)
          : undefined,
        basePrice: Number(quickAddItem.basePrice),
        quantity: data.quantity,
        notes: data.notes,
        customizations: customizationsWithDetails,
      });
    }
    setIsQuickAddOpen(false);
    setQuickAddItem(null);
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

  // Render right panel based on active state
  const renderRightPanel = () => {
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
        return <QuickSaleCartPanel storeId={storeId} />;
    }
  };

  return (
    <>
      {/* Main content area - 60/40 split */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        {/* Left panel - Menu (60%) */}
        <div className="min-h-[400px] min-w-0 flex-1 overflow-hidden lg:flex-[3]">
          <Card className="h-full overflow-hidden">
            <CardContent className="h-full p-4">
              <MenuPanel storeId={storeId} onAddToCart={handleMenuItemClick} />
            </CardContent>
          </Card>
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
        isLoading={false}
      />

      {/* Cart Recovery Dialog */}
      <CartRecoveryDialog
        open={isRecoveryDialogOpen}
        onOpenChange={setIsRecoveryDialogOpen}
        onContinue={() => setIsRecoveryDialogOpen(false)}
        onStartFresh={() => {
          clearQuickSaleCart();
          setIsRecoveryDialogOpen(false);
        }}
      />
    </>
  );
}
