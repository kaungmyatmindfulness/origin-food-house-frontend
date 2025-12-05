'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Archive } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@repo/ui/components/sheet';
import { ScrollArea } from '@repo/ui/components/scroll-area';

import { StashedOrderCard } from './StashedOrderCard';
import { StashDialog } from './StashDialog';

import type { StashedOrder } from '../store/stash.store';

interface StashedOrdersSheetProps {
  stashedOrders: StashedOrder[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  /** Whether the cart is empty (hide stash button when empty) */
  hasCartItems: boolean;
  /** Whether checkout is in progress (disable stash button) */
  isCheckingOut: boolean;
  /** Number of items in current cart */
  cartItemCount: number;
  /** Total price of current cart */
  cartTotal: number;
  /** Callback when order is stashed */
  onStash: (note: string | null) => void;
}

/**
 * Sheet component displaying all stashed orders
 * Opens from the right side
 * Includes its own trigger button with stash count badge
 * Also contains the "Stash current order" button and dialog
 */
export function StashedOrdersSheet({
  stashedOrders,
  onRestore,
  onDelete,
  hasCartItems,
  isCheckingOut,
  cartItemCount,
  cartTotal,
  onStash,
}: StashedOrdersSheetProps) {
  const t = useTranslations('sales.stashedOrders');
  const tSales = useTranslations('sales');
  const [open, setOpen] = useState(false);
  const [isStashDialogOpen, setIsStashDialogOpen] = useState(false);

  const stashCount = stashedOrders.length;
  const hasStashedOrders = stashCount > 0;

  const handleRestore = (id: string) => {
    onRestore(id);
    setOpen(false);
  };

  const handleStash = (note: string | null) => {
    onStash(note);
    setIsStashDialogOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11"
            aria-label={t('viewStashed')}
          >
            <Archive className="h-5 w-5" />
            {hasStashedOrders && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                {stashCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {t('title')}
            </SheetTitle>
            <SheetDescription>{t('description')}</SheetDescription>
          </SheetHeader>

          {/* Stash current order button - only when cart has items */}
          {hasCartItems && (
            <Button
              variant="outline"
              className="h-12 w-full"
              onClick={() => setIsStashDialogOpen(true)}
              disabled={isCheckingOut}
            >
              <Archive className="mr-2 h-4 w-4" />
              {tSales('stash.stashOrder')}
            </Button>
          )}

          {stashedOrders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="bg-muted/50 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <Archive className="text-muted-foreground h-10 w-10" />
                </div>
                <h3 className="text-foreground mb-1 font-medium">
                  {t('emptyTitle')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('emptyDescription')}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3 py-4">
                {stashedOrders.map((stashedOrder) => (
                  <StashedOrderCard
                    key={stashedOrder.id}
                    stashedOrder={stashedOrder}
                    onRestore={handleRestore}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Stash Dialog */}
      <StashDialog
        open={isStashDialogOpen}
        onOpenChange={setIsStashDialogOpen}
        itemCount={cartItemCount}
        total={cartTotal}
        onStash={handleStash}
      />
    </>
  );
}
