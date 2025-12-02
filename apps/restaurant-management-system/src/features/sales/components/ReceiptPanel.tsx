'use client';

import { useTranslations } from 'next-intl';
import {
  Printer,
  Plus,
  CheckCircle,
  Phone,
  ShoppingBag,
  Store,
  User,
  Loader2,
} from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Separator } from '@repo/ui/components/separator';

import { formatCurrency } from '@/utils/formatting';
import { getSessionTypeDisplayInfo } from '@/features/sales/utils/session-type.utils';
import { usePrintService } from '@/features/print/hooks/usePrintService';
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import type { ReceiptOrderData } from '@/features/sales/utils/transform-order-to-receipt';
import type { SessionType } from '../types/sales.types';

interface ReceiptPanelProps {
  order: ReceiptOrderData;
  onNewOrder: () => void;
  onPrint?: () => void;
}

/**
 * Session type icon mapping
 */
const sessionTypeIcons: Record<SessionType, React.ElementType> = {
  TABLE: Store,
  COUNTER: Store,
  PHONE: Phone,
  TAKEOUT: ShoppingBag,
};

export function ReceiptPanel({
  order,
  onNewOrder,
  onPrint,
}: ReceiptPanelProps) {
  const t = useTranslations('sales');
  const tPrint = useTranslations('print');

  // Get store ID for print service
  const storeId = useAuthStore(selectSelectedStoreId);

  // Print service hook
  const { printReceipt, isPrinting } = usePrintService({
    storeId: storeId ?? '',
  });

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleString();

  // Get order source info using shared utility
  const { sessionType, isQuickSale, displayName } = getSessionTypeDisplayInfo(
    order.session,
    order.tableName
  );
  const customerName = order.session?.customerName;
  const customerPhone = order.session?.customerPhone;

  // Handle print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (storeId) {
      // Use print service for proper receipt printing
      printReceipt(order);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3 text-center">
        <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{t('paymentComplete')}</CardTitle>
        <p className="text-muted-foreground text-sm">{t('thankYou')}</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {/* Receipt Content - printable area */}
        <div className="space-y-4 print:text-black" id="receipt-content">
          {/* Order Info */}
          <div className="border-b pb-4 text-center">
            <p className="text-lg font-bold">
              {t('orderNumber')}: #
              {order.orderNumber || order.id.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-muted-foreground text-sm">{orderDate}</p>

            {/* Order Source (Table/Session Type) */}
            {displayName && (
              <div className="mt-2 flex items-center justify-center gap-2">
                {sessionType && (
                  <>
                    {(() => {
                      const Icon = sessionTypeIcons[sessionType];
                      return <Icon className="text-muted-foreground h-4 w-4" />;
                    })()}
                  </>
                )}
                <span
                  className={
                    isQuickSale
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  {isQuickSale && sessionType
                    ? t(sessionType.toLowerCase())
                    : displayName}
                </span>
              </div>
            )}

            {/* Customer Info */}
            {(customerName || customerPhone) && (
              <div className="mt-2 space-y-1">
                {customerName && (
                  <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                    <User className="h-3 w-3" />
                    <span>{customerName}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    <span>{customerPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span>{item.menuItemName}</span>
                  <span className="text-muted-foreground ml-2">
                    x{item.quantity}
                  </span>
                </div>
                <span className="font-medium">
                  {formatCurrency(
                    Number(item.finalPrice || item.price) * item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span>{formatCurrency(order.subTotal)}</span>
            </div>
            {order.taxAmount && Number(order.taxAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('tax')}</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {order.vatAmount && Number(order.vatAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('vat')}</span>
                <span>{formatCurrency(order.vatAmount)}</span>
              </div>
            )}
            {order.serviceChargeAmount &&
              Number(order.serviceChargeAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('serviceCharge')}
                  </span>
                  <span>{formatCurrency(order.serviceChargeAmount)}</span>
                </div>
              )}
            {order.discountAmount && Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('discount')}</span>
                <span className="text-primary">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('total')}</span>
              <span className="text-primary">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('paymentDetails')}</p>
                {order.payments.map((payment, index) => (
                  <div key={payment.id || index} className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('method')}
                      </span>
                      <span>
                        {formatPaymentMethod(
                          payment.paymentMethod as PaymentMethodEnum,
                          t
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('amount')}
                      </span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    {payment.amountTendered &&
                      Number(payment.amountTendered) > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t('tendered')}
                            </span>
                            <span>
                              {formatCurrency(payment.amountTendered)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {t('change')}
                            </span>
                            <span>{formatCurrency(payment.change)}</span>
                          </div>
                        </>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Actions - hidden when printing */}
      <div className="space-y-2 border-t p-4 print:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={handlePrint}
          disabled={isPrinting || !storeId}
        >
          {isPrinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tPrint('printing')}
            </>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              {t('printReceipt')}
            </>
          )}
        </Button>
        <Button className="w-full" onClick={onNewOrder}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newOrder')}
        </Button>
      </div>
    </Card>
  );
}

type PaymentMethodEnum =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MOBILE_PAYMENT'
  | 'OTHER';

/**
 * Formats the payment method enum to a localized human-readable string.
 * @param method - The payment method enum value
 * @param t - Translation function from useTranslations('sales')
 */
function formatPaymentMethod(
  method: PaymentMethodEnum,
  t: (key: string) => string
): string {
  const methodKeyMap: Record<PaymentMethodEnum, string> = {
    CASH: 'paymentMethods.cash',
    CREDIT_CARD: 'paymentMethods.creditCard',
    DEBIT_CARD: 'paymentMethods.debitCard',
    MOBILE_PAYMENT: 'paymentMethods.mobilePayment',
    OTHER: 'paymentMethods.other',
  };

  return t(methodKeyMap[method] || 'paymentMethods.other');
}
