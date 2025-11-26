'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, Minus, Plus, Trash2, Coffee } from 'lucide-react';

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
import { SaveIndicator } from './SaveIndicator';
import { useQuickSaleCart } from '../hooks/useQuickSaleCart';
import { formatCurrency } from '@/utils/formatting';

import type { DraftCartItem } from '../store/quick-sale-cart.store';

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

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.localId, item.quantity - 1)}
            disabled={disabled}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.localId, item.quantity + 1)}
            disabled={disabled}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-7 w-7"
          onClick={() => onRemove(item.localId)}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
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
 */
export function QuickSaleCartPanel({ storeId }: QuickSaleCartPanelProps) {
  const t = useTranslations('sales');

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

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-4 pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </span>
          <div className="flex items-center gap-3">
            <SaveIndicator />
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
  );
}
