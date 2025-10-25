'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { ManualOrderDialog } from '@/features/orders/components/ManualOrderDialog';

export default function SalesPage() {
  const t = useTranslations('pages');
  const tOrders = useTranslations('orders');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('salesPage')}</h1>
          <p className="text-muted-foreground mt-2">
            {tOrders('salesPageDescription')}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {tOrders('createManualOrder')}
        </Button>
      </div>

      {/* Manual Order Dialog */}
      <ManualOrderDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Placeholder for future order list/history */}
      <div className="mt-8 flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground text-center">
          {tOrders('orderHistoryPlaceholder')}
        </p>
      </div>
    </div>
  );
}
