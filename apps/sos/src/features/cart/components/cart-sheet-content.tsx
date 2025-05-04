import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo } from 'react';

import { formatCurrency } from '@/utils/formatting'; // Adjust path
import { Button } from '@repo/ui/components/button'; // Adjust path
import { ScrollArea } from '@repo/ui/components/scroll-area'; // Adjust path
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet'; // Adjust path
import { useCartStore } from '@/features/cart/store/cart.store';

interface CartSheetContentProps {
  // cart prop removed - state comes from store
  currency: string;
  onIncrement: (
    cartItemId: string | undefined,
    menuItemId: string | undefined
  ) => void;
  onDecrement: (
    cartItemId: string | undefined,
    menuItemId: string | undefined
  ) => void;
  onRemoveItem: (cartItemId: string | undefined) => void;
  onClearCart: () => void;
  // isLoading prop removed
}

export function CartSheetContent({
  // cart prop removed
  currency,
  onIncrement,
  onDecrement,
  onRemoveItem,
  onClearCart,
  // isLoading prop removed
}: CartSheetContentProps) {
  // Get cart state directly from the store
  const cart = useCartStore((state) => state.cart);
  const itemsArray = cart?.items ?? [];

  // Calculate total based on store state
  const cartTotal = useMemo(() => {
    return itemsArray.reduce((sum, cartItem) => {
      // Ensure menuItem exists and basePrice is valid before parsing
      const basePrice = parseFloat(cartItem.menuItem?.basePrice ?? '0');
      let customizationPrice = 0;
      if (cartItem.selectedOptions) {
        customizationPrice = cartItem.selectedOptions.reduce((optSum, opt) => {
          // Ensure additionalPrice is valid before parsing
          return optSum + parseFloat(opt.additionalPrice?.toString() ?? '0');
        }, 0);
      }
      return sum + (basePrice + customizationPrice) * cartItem.quantity;
    }, 0);
  }, [itemsArray]); // Dependency is now itemsArray derived from store

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
                  {/* Item Image */}
                  <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    {/* Use a default placeholder */}
                    <Image
                      // Use optional chaining and provide a fallback source
                      src={
                        cartItem.menuItem?.imageUrl ?? '/placeholder-image.png'
                      }
                      alt={cartItem.menuItem?.name ?? 'Item image'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes attribute
                      className="object-cover"
                      // More robust error handling
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${cartItem.menuItem?.imageUrl}`
                        );
                        e.currentTarget.src = '/placeholder-image.png'; // Fallback to placeholder
                        e.currentTarget.srcset = ''; // Clear srcset as well
                      }}
                    />
                  </div>
                  {/* Item Details */}
                  <div className="flex-grow">
                    <p className="font-medium">{cartItem.menuItem?.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatCurrency(cartItem.menuItem?.basePrice, currency)}
                    </p>
                    {/* Display selected customizations */}
                    {cartItem.selectedOptions &&
                      cartItem.selectedOptions.length > 0 && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          {cartItem.selectedOptions.map((opt) => (
                            <span
                              key={opt.id}
                              className="mr-1 inline-block rounded bg-gray-100 px-1.5 py-0.5"
                            >
                              + {opt.name}{' '}
                              {opt.additionalPrice &&
                              (Number(opt.additionalPrice) || 0) > 0
                                ? `(${formatCurrency(opt.additionalPrice, currency)})`
                                : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    {/* Display notes */}
                    {cartItem.notes && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        Notes: {cartItem.notes}
                      </p>
                    )}
                  </div>
                  {/* Quantity Controls */}
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        // Pass cartItem.id and menuItem.id if available
                        onDecrement(cartItem.id, cartItem.menuItem?.id)
                      }
                      // disabled={isLoading} removed
                      aria-label={`Decrease quantity of ${cartItem.menuItem?.name}`}
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
                      onClick={() =>
                        // Pass cartItem.id and menuItem.id if available
                        onIncrement(cartItem.id, cartItem.menuItem?.id)
                      }
                      // disabled={isLoading} removed
                      aria-label={`Increase quantity of ${cartItem.menuItem?.name}`}
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
                    // disabled={isLoading} removed
                    aria-label={`Remove ${cartItem.menuItem?.name} from basket`}
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
