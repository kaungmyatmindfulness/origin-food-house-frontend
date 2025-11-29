'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@repo/ui/components/button';

import { formatCurrency } from '@/utils/formatting';

import type { CartItemResponseDto } from '@/features/sales/types/sales.types';

interface CartItemProps {
  item: CartItemResponseDto;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const t = useTranslations('sales');

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  // Calculate line total using basePrice
  const lineTotal = Number(item.basePrice) * item.quantity;

  // Notes is now properly typed as string | null | undefined from corrected types
  const notesText = item.notes ?? null;

  return (
    <div className="border-border flex items-start gap-3 border-b py-3 last:border-0">
      {/* Item info */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium">
          {item.menuItemName}
        </p>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.customizations
              .map((c: { optionName: string }) => c.optionName)
              .join(', ')}
          </p>
        )}

        {/* Notes */}
        {notesText && notesText.trim() && (
          <p className="text-muted-foreground mt-0.5 text-xs italic">
            {t('note')}: {notesText}
          </p>
        )}

        <p className="text-muted-foreground mt-1 text-sm">
          {formatCurrency(Number(item.basePrice))} x {item.quantity}
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
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
