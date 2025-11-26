'use client';

import { useTranslations } from 'next-intl';

import { Separator } from '@repo/ui/components/separator';

import { formatCurrency } from '@/utils/formatting';

interface CartTotalsProps {
  subtotal: number;
  taxRate?: number;
}

export function CartTotals({ subtotal, taxRate = 0.07 }: CartTotalsProps) {
  const t = useTranslations('sales');

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{t('subtotal')}</span>
        <span className="text-foreground">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {t('tax')} ({(taxRate * 100).toFixed(0)}%)
        </span>
        <span className="text-foreground">{formatCurrency(tax)}</span>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-semibold">
        <span className="text-foreground">{t('total')}</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
