'use client';

import { useTranslations } from 'next-intl';
import { ClipboardList, Plus, CreditCard } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Skeleton } from '@repo/ui/components/skeleton';

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { formatCurrency } from '@/utils/formatting';

/**
 * Order status type matching the API schema
 */
type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

interface TableOrderPanelProps {
  orderId: string;
  onAddMoreItems: () => void;
  onProceedToPayment: () => void;
}

/**
 * Status badge variant mapping
 */
function getStatusVariant(
  status: OrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'PREPARING':
      return 'default';
    case 'READY':
      return 'outline';
    case 'SERVED':
      return 'outline';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function TableOrderPanel({
  orderId,
  onAddMoreItems,
  onProceedToPayment,
}: TableOrderPanelProps) {
  const t = useTranslations('sales');

  // Fetch order data
  const {
    data: orderResponse,
    isLoading,
    error,
  } = $api.useQuery(
    'get',
    API_PATHS.rmsOrder,
    {
      params: {
        path: { orderId },
      },
    },
    {
      enabled: !!orderId,
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000, // Poll for status updates
    }
  );

  const order = orderResponse?.data ?? null;

  // Loading state
  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            {t('currentOrder')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            {t('currentOrder')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-destructive">{t('failedToLoadOrder')}</p>
        </CardContent>
      </Card>
    );
  }

  const canAddItems =
    order.status === 'PENDING' || order.status === 'PREPARING';
  const canPay = !order.isPaidInFull;
  const itemCount = order.orderItems?.length ?? 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('orderNumber')} #{order.orderNumber}
          </span>
          <Badge variant={getStatusVariant(order.status)}>
            {t(`orderStatus.${order.status.toLowerCase()}`)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Order items list */}
        {itemCount === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <p className="text-muted-foreground">{t('noItemsInOrder')}</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="py-2">
              {order.orderItems?.map((item) => {
                const itemPrice = Number(item.price);
                const lineTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="border-border flex items-start gap-3 border-b py-3 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground truncate font-medium">
                          {item.menuItemName ?? 'Item'}
                        </p>
                      </div>

                      {/* Customizations */}
                      {item.customizations &&
                        item.customizations.length > 0 && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {item.customizations
                              .map((c) => c.optionName ?? 'Option')
                              .join(', ')}
                          </p>
                        )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-muted-foreground mt-0.5 text-xs italic">
                          {t('note')}: {item.notes}
                        </p>
                      )}

                      <p className="text-muted-foreground mt-1 text-sm">
                        {formatCurrency(itemPrice)} x {item.quantity}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-foreground font-semibold">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer with totals and actions */}
        <div className="border-border space-y-4 border-t p-6">
          {/* Totals */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(Number(order.subTotal))}</span>
            </div>
            {Number(order.vatAmount) > 0 && (
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>{t('vat')}</span>
                <span>{formatCurrency(Number(order.vatAmount))}</span>
              </div>
            )}
            {Number(order.serviceChargeAmount) > 0 && (
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>{t('serviceCharge')}</span>
                <span>{formatCurrency(Number(order.serviceChargeAmount))}</span>
              </div>
            )}
            {order.discountAmount && Number(order.discountAmount) > 0 && (
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>{t('discount')}</span>
                <span>-{formatCurrency(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="text-foreground flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span>{formatCurrency(Number(order.grandTotal))}</span>
            </div>
            {order.isPaidInFull && (
              <div className="text-primary flex justify-between text-sm font-medium">
                <span>{t('paymentComplete')}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {canAddItems && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onAddMoreItems}
              >
                <Plus className="mr-2 h-5 w-5" />
                {t('addMoreItems')}
              </Button>
            )}
            {canPay && (
              <Button size="lg" className="w-full" onClick={onProceedToPayment}>
                <CreditCard className="mr-2 h-5 w-5" />
                {t('proceedToPayment')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
