'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Minus, Plus, Trash2, Coffee } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';

import { SessionTypePills } from './SessionTypePills';
import { CartTotals } from './CartTotals';
import { CustomerInfoInput } from './CustomerInfoInput';
import { OrderNotesInput } from './OrderNotesInput';
import { StashedOrdersSheet } from './StashedOrdersSheet';
import { RestoreConflictDialog } from './RestoreConflictDialog';
import { useQuickSaleCart } from '../hooks/useQuickSaleCart';
import { useStashStore } from '../hooks/useStashStore';
import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';
import { formatCurrency } from '@/utils/formatting';

import type { DraftCartItem } from '../store/quick-sale-cart.store';
import type { RestoreConflictAction } from './RestoreConflictDialog';

interface QuickSaleCartPanelProps {
  storeId: string;
}

/**
 * Cart item row for quick sale cart
 */
function QuickSaleCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled,
}: {
  item: DraftCartItem;
  onUpdateQuantity: (localId: string, quantity: number) => void;
  onRemove: (localId: string) => void;
  disabled?: boolean;
}) {
  const customizationTotal = item.customizations.reduce(
    (sum, c) => sum + c.additionalPrice,
    0
  );
  const itemTotal = (item.basePrice + customizationTotal) * item.quantity;

  return (
    <div className="border-border flex items-start gap-3 border-b py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.menuItemName}</p>

        {item.customizations.length > 0 && (
          <p className="text-muted-foreground mt-1 text-xs">
            {item.customizations.map((c) => c.optionName).join(', ')}
          </p>
        )}

        {item.notes && (
          <p className="text-muted-foreground mt-1 text-xs italic">
            {item.notes}
          </p>
        )}

        <p className="text-muted-foreground mt-1 text-sm">
          {formatCurrency(itemTotal)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={() => onUpdateQuantity(item.localId, item.quantity - 1)}
            disabled={disabled}
          >
            <Minus className="h-5 w-5" />
          </Button>

          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 active:scale-95"
            onClick={() => onUpdateQuantity(item.localId, item.quantity + 1)}
            disabled={disabled}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-11 w-11 active:scale-95"
          onClick={() => onRemove(item.localId)}
          disabled={disabled}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Quick Sale Cart Panel
 *
 * Uses localStorage-backed cart for instant UI updates.
 * On checkout, syncs to backend and creates order.
 * Includes stash functionality to save and restore orders.
 */
export function QuickSaleCartPanel({ storeId }: QuickSaleCartPanelProps) {
  const t = useTranslations('sales');

  // Cart state and actions
  const {
    items,
    subtotal,
    itemCount,
    isEmpty,
    updateQuantity,
    removeItem,
    checkout,
    isCheckingOut,
  } = useQuickSaleCart({ storeId });

  // Direct cart store access for stash operations
  const clearCart = useQuickSaleCartStore((state) => state.clearCart);
  const addItem = useQuickSaleCartStore((state) => state.addItem);

  // Stash state and actions
  const { stashedOrders, stashOrder, restoreOrder, deleteStashedOrder } =
    useStashStore(storeId);

  // Dialog states
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);

  // Pending restore state (when conflict dialog is shown)
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingRestoreItemCount, setPendingRestoreItemCount] = useState(0);

  /**
   * Helper to add restored items to cart
   * Extracts the repeated item addition logic
   */
  const addRestoredItemsToCart = useCallback(
    (restoredItems: DraftCartItem[]) => {
      restoredItems.forEach((item) => {
        addItem({
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          menuItemImage: item.menuItemImage,
          basePrice: item.basePrice,
          quantity: item.quantity,
          customizations: item.customizations,
          notes: item.notes,
        });
      });
    },
    [addItem]
  );

  /**
   * Handle stash order action
   */
  const handleStashOrder = useCallback(
    (note: string | null) => {
      stashOrder(items, note);
      clearCart();
      toast.success(t('stash.orderStashed'));
    },
    [items, stashOrder, clearCart, t]
  );

  /**
   * Handle restore order - check for conflicts first
   */
  const handleRestoreOrder = useCallback(
    (id: string) => {
      const stashedOrder = stashedOrders.find((order) => order.id === id);
      if (!stashedOrder) return;

      if (!isEmpty) {
        // Cart has items - show conflict dialog
        setPendingRestoreId(id);
        setPendingRestoreItemCount(stashedOrder.itemCount);
        setIsConflictDialogOpen(true);
      } else {
        // Cart is empty - restore directly
        const restoredItems = restoreOrder(id);
        if (restoredItems) {
          addRestoredItemsToCart(restoredItems);
          toast.success(t('stash.orderRestored'));
        } else {
          toast.error(t('stash.restoreError'));
        }
      }
    },
    [stashedOrders, isEmpty, restoreOrder, addRestoredItemsToCart, t]
  );

  /**
   * Handle conflict resolution action
   */
  const handleConflictAction = useCallback(
    (action: RestoreConflictAction) => {
      if (!pendingRestoreId) return;

      const restoredItems = restoreOrder(pendingRestoreId);
      if (!restoredItems) {
        toast.error(t('stash.restoreError'));
        setPendingRestoreId(null);
        setPendingRestoreItemCount(0);
        return;
      }

      switch (action) {
        case 'replace':
          // Clear cart and add restored items
          clearCart();
          addRestoredItemsToCart(restoredItems);
          toast.success(t('stash.orderRestored'));
          break;

        case 'merge':
          // Add restored items to existing cart (don't clear)
          addRestoredItemsToCart(restoredItems);
          toast.success(t('stash.ordersMerged'));
          break;

        case 'stash-first':
          // Stash current cart first, then restore
          stashOrder(items, null);
          clearCart();
          addRestoredItemsToCart(restoredItems);
          toast.success(t('stash.currentStashedAndRestored'));
          break;
      }

      // Reset pending state
      setPendingRestoreId(null);
      setPendingRestoreItemCount(0);
    },
    [
      pendingRestoreId,
      restoreOrder,
      clearCart,
      addRestoredItemsToCart,
      stashOrder,
      items,
      t,
    ]
  );

  /**
   * Handle delete stashed order
   */
  const handleDeleteStashedOrder = useCallback(
    (id: string) => {
      deleteStashedOrder(id);
      toast.success(t('stash.orderDeleted'));
    },
    [deleteStashedOrder, t]
  );

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="space-y-4 pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('cart')}
            </span>
            <div className="flex items-center gap-3">
              {/* Stashed orders sheet (includes its own trigger button and stash functionality) */}
              <StashedOrdersSheet
                stashedOrders={stashedOrders}
                onRestore={handleRestoreOrder}
                onDelete={handleDeleteStashedOrder}
                hasCartItems={!isEmpty}
                isCheckingOut={isCheckingOut}
                cartItemCount={itemCount}
                cartTotal={subtotal}
                onStash={handleStashOrder}
              />

              {itemCount > 0 && (
                <span className="text-muted-foreground text-sm font-normal">
                  {itemCount} {itemCount === 1 ? t('item') : t('items')}
                </span>
              )}
            </div>
          </CardTitle>

          {/* Session type selector */}
          <SessionTypePills />
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Cart items list */}
          {isEmpty ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="text-center">
                {/* Improved empty state illustration */}
                <div className="bg-muted/50 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <Coffee className="text-muted-foreground h-10 w-10" />
                </div>
                <h3 className="text-foreground mb-1 font-medium">
                  {t('emptyState.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('emptyState.description')}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-6">
              <div className="py-2">
                {items.map((item) => (
                  <QuickSaleCartItem
                    key={item.localId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    disabled={isCheckingOut}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Footer with customer info, notes, totals and checkout */}
          <div className="border-border space-y-4 border-t p-6">
            {/* Customer info (collapsible) */}
            {!isEmpty && <CustomerInfoInput disabled={isCheckingOut} />}

            {/* Order notes */}
            {!isEmpty && <OrderNotesInput disabled={isCheckingOut} />}

            <CartTotals subtotal={subtotal} />

            <Button
              className="w-full"
              size="lg"
              onClick={() => checkout()}
              disabled={isEmpty || isCheckingOut}
            >
              {isCheckingOut ? t('processing') : t('checkout')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restore Conflict Dialog */}
      <RestoreConflictDialog
        open={isConflictDialogOpen}
        onOpenChange={(open) => {
          setIsConflictDialogOpen(open);
          if (!open) {
            setPendingRestoreId(null);
            setPendingRestoreItemCount(0);
          }
        }}
        onAction={handleConflictAction}
        currentItemCount={itemCount}
        stashedItemCount={pendingRestoreItemCount}
      />
    </>
  );
}
