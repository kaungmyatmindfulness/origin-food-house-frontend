'use client';

import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { ShoppingCart, Clock, Trash2 } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';

import { formatCurrency } from '@/utils/formatting';

import type { StashedOrder } from '../store/stash.store';

interface StashedOrderCardProps {
  stashedOrder: StashedOrder;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Card component displaying a single stashed order
 * Tappable area for restore, with separate delete button
 */
export function StashedOrderCard({
  stashedOrder,
  onRestore,
  onDelete,
}: StashedOrderCardProps) {
  const t = useTranslations('sales.stash');

  const relativeTime = formatDistanceToNow(new Date(stashedOrder.stashedAt), {
    addSuffix: true,
  });

  const handleRestore = () => {
    onRestore(stashedOrder.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDelete(stashedOrder.id);
  };

  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer transition-colors active:scale-[0.99]"
      onClick={handleRestore}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Main content area */}
        <div className="min-w-0 flex-1">
          {/* Note or placeholder */}
          <p className="truncate font-medium">
            {stashedOrder.note ?? t('noNote')}
          </p>

          {/* Item count and total */}
          <div className="mt-1 flex items-center gap-4">
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <ShoppingCart className="h-4 w-4" />
              {stashedOrder.itemCount}{' '}
              {stashedOrder.itemCount === 1 ? t('item') : t('items')}
            </span>
            <span className="text-sm font-semibold">
              {formatCurrency(stashedOrder.total)}
            </span>
          </div>

          {/* Relative time */}
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs">
              {relativeTime}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11 w-11 shrink-0 active:scale-95"
          onClick={handleDelete}
          aria-label={t('delete')}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
