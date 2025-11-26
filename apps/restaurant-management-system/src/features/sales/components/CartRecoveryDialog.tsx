'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, Trash2 } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';

import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';

interface CartRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onStartFresh: () => void;
}

/**
 * Dialog shown on page load when localStorage has items from a previous order.
 * Gives the user options to continue their order or start fresh.
 */
export function CartRecoveryDialog({
  open,
  onOpenChange,
  onContinue,
  onStartFresh,
}: CartRecoveryDialogProps) {
  const t = useTranslations('sales');

  const items = useQuickSaleCartStore((state) => state.items);
  const getSubtotal = useQuickSaleCartStore((state) => state.getSubtotal);
  const getItemCount = useQuickSaleCartStore((state) => state.getItemCount);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  const handleContinue = () => {
    onContinue();
    onOpenChange(false);
  };

  const handleStartFresh = () => {
    onStartFresh();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('cartRecovery.title')}
          </DialogTitle>
          <DialogDescription>
            {t('cartRecovery.description', { count: itemCount })}
          </DialogDescription>
        </DialogHeader>

        {/* Cart preview */}
        <div className="bg-muted/50 space-y-3 rounded-lg p-4">
          <div className="text-sm">
            <p className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? t('item') : t('items')}
            </p>
            <ul className="mt-2 space-y-1">
              {items.slice(0, 3).map((item) => (
                <li
                  key={item.localId}
                  className="text-foreground flex justify-between text-sm"
                >
                  <span className="truncate">
                    {item.quantity}x {item.menuItemName}
                  </span>
                </li>
              ))}
              {items.length > 3 && (
                <li className="text-muted-foreground text-xs">
                  {t('cartRecovery.andMore', { count: items.length - 3 })}
                </li>
              )}
            </ul>
          </div>

          <div className="border-border flex justify-between border-t pt-3">
            <span className="text-muted-foreground text-sm">
              {t('subtotal')}
            </span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleStartFresh}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('cartRecovery.startFresh')}
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('cartRecovery.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
