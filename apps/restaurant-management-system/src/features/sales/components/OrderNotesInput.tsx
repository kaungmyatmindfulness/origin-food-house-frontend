'use client';

import { useTranslations } from 'next-intl';
import { StickyNote } from 'lucide-react';

import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { cn } from '@repo/ui/lib/utils';

import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';

const MAX_NOTES_LENGTH = 500;

interface OrderNotesInputProps {
  className?: string;
  disabled?: boolean;
}

/**
 * Order-level notes input for quick sale orders.
 * Allows customers/staff to add special instructions that apply to the entire order.
 */
export function OrderNotesInput({ className, disabled }: OrderNotesInputProps) {
  const t = useTranslations('sales');

  const orderNotes = useQuickSaleCartStore((state) => state.orderNotes);
  const setOrderNotes = useQuickSaleCartStore((state) => state.setOrderNotes);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce character limit
    if (value.length <= MAX_NOTES_LENGTH) {
      setOrderNotes(value);
    }
  };

  const characterCount = orderNotes?.length ?? 0;
  const isNearLimit = characterCount > MAX_NOTES_LENGTH * 0.8;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label
        htmlFor="order-notes"
        className="text-muted-foreground flex items-center gap-1.5 text-xs"
      >
        <StickyNote className="h-3.5 w-3.5" />
        {t('orderNotes.title')}
      </Label>

      <Textarea
        id="order-notes"
        value={orderNotes ?? ''}
        onChange={handleNotesChange}
        placeholder={t('orderNotes.placeholder')}
        className="min-h-[80px] resize-none"
        disabled={disabled}
        maxLength={MAX_NOTES_LENGTH}
      />

      <div className="flex justify-end">
        <span
          className={cn(
            'text-xs',
            isNearLimit ? 'text-warning' : 'text-muted-foreground',
            characterCount >= MAX_NOTES_LENGTH && 'text-destructive'
          )}
        >
          {characterCount}/{MAX_NOTES_LENGTH}
        </span>
      </div>
    </div>
  );
}
