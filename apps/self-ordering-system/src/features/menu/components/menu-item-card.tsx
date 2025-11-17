import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { useParams } from 'next/navigation';

import { CartItem } from '@/features/cart/types/cart.types';
import { MenuItem, SupportedLocale } from '@/features/menu/types/menu.types';
import {
  getTranslatedName,
  getTranslatedDescription,
} from '@/features/menu/utils/translation.util';
import { formatCurrency } from '@/utils/formatting';
import { Button } from '@repo/ui/components/button';
import {
  OptimisticAddCartItem,
  useCartStore,
} from '@/features/cart/store/cart.store';
import { toast } from '@repo/ui/lib/toast';
import { getImageUrl } from '@repo/api/utils/s3-url';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  /** Callback function to open the customization dialog for this item */
  onCustomize: (item: MenuItem) => void;
}

/**
 * Renders a card for a single menu item, displaying its details, price,
 * and controls to add/increment/decrement in the cart.
 * Integrates with useCartStore for cart state and actions.
 */
export function MenuItemCard({
  item,
  currency,
  onCustomize,
}: MenuItemCardProps) {
  const params = useParams();
  const locale = params.locale as SupportedLocale;

  const cart = useCartStore((state) => state.cart);
  const optimisticAddItem = useCartStore((state) => state.optimisticAddItem);
  const optimisticUpdateItem = useCartStore(
    (state) => state.optimisticUpdateItem
  );
  const optimisticRemoveItem = useCartStore(
    (state) => state.optimisticRemoveItem
  );

  // Get localized content
  const displayName = getTranslatedName(item.name, item.translations, locale);
  const displayDescription = getTranslatedDescription(
    item.description,
    item.translations,
    locale
  );

  const cartItem = React.useMemo(() => {
    if (!cart || !item.id) return undefined;

    return cart.items.find((ci) => ci.menuItem.id === item.id);
  }, [cart, item.id]);

  const cartQuantity = cartItem?.quantity ?? 0;

  /** Generic error handler for optimistic actions */
  const handleApiError = (action: string, error: unknown) => {
    console.error(`Error during ${action}:`, error);
    toast.error(`Failed to ${action} ${item.name}. Please try again later.`);
  };

  /** Handles the click on the add button or the item itself if needed */
  const handleAddToCartClick = () => {
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      onCustomize(item);
    } else {
      const cartItemPayload: OptimisticAddCartItem = {
        quantity: 1,
        notes: '',
        menuItem: item,
        selectedOptions: [],
      };

      optimisticAddItem(cartItemPayload).catch((err) =>
        handleApiError('add item', err)
      );
    }
  };

  /** Handles increasing the quantity */
  const handleIncrementClick = () => {
    if (!cartItem) {
      console.error(
        'Increment failed: CartItem not found for MenuItem ID',
        item.id
      );
      return;
    }

    const updatedItemPayload: CartItem = {
      ...cartItem,
      quantity: cartItem.quantity + 1,
    };

    optimisticUpdateItem(updatedItemPayload).catch((err) =>
      handleApiError('increase quantity', err)
    );
  };

  /** Handles decreasing the quantity or removing the item */
  const handleDecrementClick = () => {
    if (!cartItem) {
      console.error(
        'Decrement failed: CartItem not found for MenuItem ID',
        item.id
      );
      return;
    }

    if (cartItem.quantity > 1) {
      const updatedItemPayload: CartItem = {
        ...cartItem,
        quantity: cartItem.quantity - 1,
      };

      optimisticUpdateItem(updatedItemPayload).catch((err) =>
        handleApiError('decrease quantity', err)
      );
    } else {
      optimisticRemoveItem(cartItem.id).catch((err) =>
        handleApiError('remove item', err)
      );
    }
  };

  return (
    <div className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0">
      {/* Image Container */}
      <div className="bg-muted relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-28">
        {getImageUrl(item.imagePath, 'small') ? (
          <Image
            src={getImageUrl(item.imagePath, 'small')!}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-grow flex-col justify-between gap-1">
        {/* Top section: Name and Description */}
        <div>
          <h3 className="text-lg font-semibold">{displayName}</h3>
          {displayDescription && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {' '}
              {/* Limit description lines */}
              {displayDescription}
            </p>
          )}
        </div>

        {/* Bottom section: Price and Action Button/Quantity Controls */}
        <div className="mt-2 flex items-end justify-between">
          {/* Price Display */}
          <p className="text-base font-semibold text-gray-800">
            {formatCurrency(item.basePrice, currency)}
          </p>
          {/* Action Area: Show Add button or Quantity controls */}
          <div className="flex-shrink-0">
            {cartQuantity === 0 ? (
              <Button
                onClick={handleAddToCartClick}
                aria-label={`Add ${item.name} to cart`}
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-2">
                {/* Decrease Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleDecrementClick}
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                {/* Quantity Display */}
                <span
                  className="min-w-[1.5rem] text-center text-lg font-semibold"
                  aria-live="polite"
                >
                  {cartQuantity}
                </span>
                {/* Increase Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleIncrementClick}
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
