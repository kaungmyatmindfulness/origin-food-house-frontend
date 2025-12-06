'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@repo/ui/components/button';

import { formatCurrency } from '@/utils/formatting';

import type { TableSaleCartItem as TableSaleCartItemType } from '../store/table-sale-cart.store';

interface TableSaleCartItemProps {
  item: TableSaleCartItemType;
  onUpdateQuantity: (localId: string, quantity: number) => void;
  onRemove: (localId: string) => void;
  disabled?: boolean;
}

export function TableSaleCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: TableSaleCartItemProps) {
  const t = useTranslations('sales');

  const handleIncrement = () => {
    onUpdateQuantity(item.localId, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.localId, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.localId);
  };

  // Calculate line total including customizations
  const customizationTotal = item.customizations.reduce(
    (sum, c) => sum + c.additionalPrice,
    0
  );
  const lineTotal = (item.basePrice + customizationTotal) * item.quantity;

  return (
    <div className="border-border flex items-start gap-3 border-b py-3 last:border-0">
      {/* Item info */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium">
          {item.menuItemName}
        </p>

        {/* Customizations */}
        {item.customizations.length > 0 && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.customizations.map((c) => c.optionName).join(', ')}
          </p>
        )}

        {/* Notes */}
        {item.notes && item.notes.trim() && (
          <p className="text-muted-foreground mt-0.5 text-xs italic">
            {t('note')}: {item.notes}
          </p>
        )}

        <p className="text-muted-foreground mt-1 text-sm">
          {formatCurrency(item.basePrice + customizationTotal)} x{' '}
          {item.quantity}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 active:scale-95"
          onClick={handleDecrement}
          disabled={disabled || item.quantity <= 1}
          aria-label={t('decreaseQuantity', { itemName: item.menuItemName })}
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
          onClick={handleIncrement}
          disabled={disabled}
          aria-label={t('increaseQuantity', { itemName: item.menuItemName })}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Line total and remove */}
      <div className="flex flex-col items-end gap-2">
        <p className="text-foreground font-semibold">
          {formatCurrency(lineTotal)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11 w-11 active:scale-95"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={t('removeItem', { itemName: item.menuItemName })}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
