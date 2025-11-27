import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';

import { formatCurrency } from '@/utils/formatting';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import {
  useCartStore,
  type CartItemDto,
} from '@/features/cart/store/cart.store';

interface CartSheetContentProps {
  currency: string;
  onIncrement: (cartItemId: string) => void;
  onDecrement: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
}

export function CartSheetContent({
  currency,
  onIncrement,
  onDecrement,
  onRemoveItem,
  onClearCart,
}: CartSheetContentProps) {
  // Get cart state directly from the store
  const cart = useCartStore((state) => state.cart);

  // Memoize itemsArray to prevent useMemo dependency issues
  const itemsArray = useMemo<CartItemDto[]>(
    () => cart?.items ?? [],
    [cart?.items]
  );

  // Calculate total based on store state
  // Note: We use subTotal from cart if available, otherwise calculate from items
  const cartTotal = useMemo(() => {
    if (cart?.subTotal) {
      return parseFloat(cart.subTotal);
    }
    return itemsArray.reduce((sum, cartItem) => {
      const basePrice = parseFloat(cartItem.basePrice);
      const customizationPrice = cartItem.customizations.reduce(
        (optSum, opt) => optSum + parseFloat(opt.additionalPrice),
        0
      );
      return sum + (basePrice + customizationPrice) * cartItem.quantity;
    }, 0);
  }, [cart?.subTotal, itemsArray]);

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Basket</SheetTitle>
      </SheetHeader>
      {itemsArray.length === 0 ? (
        <div className="text-muted-foreground flex flex-grow flex-col items-center justify-center">
          <ShoppingBasket className="mb-4 h-16 w-16" />
          <p>Your basket is empty.</p>
        </div>
      ) : (
        <>
          <ScrollArea className="my-4 -mr-6 flex-grow pr-6">
            <div className="space-y-4">
              {itemsArray.map((cartItem) => (
                <div key={cartItem.id} className="flex items-center gap-4">
                  {/* Item Details */}
                  <div className="flex-grow">
                    <p className="font-medium">{cartItem.menuItemName}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatCurrency(cartItem.basePrice, currency)}
                    </p>
                    {/* Display selected customizations */}
                    {cartItem.customizations.length > 0 && (
                      <div className="text-muted-foreground mt-1 text-xs">
                        {cartItem.customizations.map((opt) => (
                          <span
                            key={opt.id}
                            className="bg-muted mr-1 inline-block rounded px-1.5 py-0.5"
                          >
                            + {opt.optionName}{' '}
                            {Number(opt.additionalPrice) > 0
                              ? `(${formatCurrency(opt.additionalPrice, currency)})`
                              : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Display notes */}
                    {cartItem.notes && (
                      <p className="text-muted-foreground mt-1 text-xs italic">
                        Notes: {String(cartItem.notes)}
                      </p>
                    )}
                  </div>
                  {/* Quantity Controls */}
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDecrement(cartItem.id)}
                      aria-label={`Decrease quantity of ${cartItem.menuItemName}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span
                      className="w-5 text-center text-sm font-medium"
                      aria-live="polite"
                    >
                      {cartItem.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onIncrement(cartItem.id)}
                      aria-label={`Increase quantity of ${cartItem.menuItemName}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-7 w-7 flex-shrink-0"
                    onClick={() => onRemoveItem(cartItem.id)}
                    aria-label={`Remove ${cartItem.menuItemName} from basket`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Cart Footer */}
          <SheetFooter className="mt-auto space-y-4 border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(cartTotal, currency)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onClearCart}
                // disabled={isLoading} removed
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Basket
              </Button>
              <SheetClose asChild>
                {/* TODO: Add actual checkout/order confirmation logic */}
                <Button /* disabled={isLoading} removed */>
                  Proceed to Checkout
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </>
      )}
    </SheetContent>
  );
}
