'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, ChefHat, Loader2 } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';

import { TableSaleCartItem } from './TableSaleCartItem';
import { CartTotals } from './CartTotals';

import type { TableSaleCartItem as TableSaleCartItemType } from '../store/table-sale-cart.store';

interface TableSaleCartPanelProps {
  items: TableSaleCartItemType[];
  onUpdateQuantity: (localId: string, quantity: number) => void;
  onRemove: (localId: string) => void;
  onSendToKitchen: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  isLoading: boolean;
  isAddingToOrder: boolean;
  tableNumber?: string;
}

export function TableSaleCartPanel({
  items,
  onUpdateQuantity,
  onRemove,
  onSendToKitchen,
  getSubtotal,
  getItemCount,
  isLoading,
  isAddingToOrder,
  tableNumber,
}: TableSaleCartPanelProps) {
  const t = useTranslations('sales');

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const hasItems = items.length > 0;

  // Empty state - no session
  if (!tableNumber) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">{t('selectTableToStart')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isAddingToOrder ? t('additionalItems') : t('cart')}
          </span>
          {itemCount > 0 && (
            <span className="text-muted-foreground text-sm font-normal">
              {itemCount} {itemCount === 1 ? t('item') : t('items')}
            </span>
          )}
        </CardTitle>
        {tableNumber && (
          <p className="text-muted-foreground text-sm">
            {t('tableNumber', { number: tableNumber })}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Cart items list */}
        {!hasItems ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <p className="text-muted-foreground">{t('emptyCart')}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {t('addItemsToStart')}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="py-2">
              {items.map((item) => (
                <TableSaleCartItem
                  key={item.localId}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                  disabled={isLoading}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer with totals and send to kitchen */}
        <div className="border-border space-y-4 border-t p-6">
          <CartTotals subtotal={subtotal} />

          <Button
            className="w-full"
            size="lg"
            onClick={onSendToKitchen}
            disabled={!hasItems || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('sending')}
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-5 w-5" />
                {t('sendToKitchen')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
