'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  TypedTabs,
  TabsContent,
  type TypedTab,
} from '@repo/ui/components/typed-tabs';
import { Textarea } from '@repo/ui/components/textarea';

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { formatCurrency } from '@/utils/formatting';

import type { RecordPaymentDto } from '@repo/api/generated/types';

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'MOBILE_PAYMENT';

interface PaymentPanelProps {
  orderId: string;
  orderTotal: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export function PaymentPanel({
  orderId,
  orderTotal,
  onPaymentSuccess,
  onBack,
}: PaymentPanelProps) {
  const t = useTranslations('sales');
  const tPayments = useTranslations('payments');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Quick amounts for cash - filter to show amounts >= order total
  const quickAmounts = [50, 100, 200, 500, 1000].filter(
    (amt) => amt >= orderTotal
  );

  // Calculate change
  const parsedTendered = parseFloat(amountTendered) || 0;
  const change = parsedTendered - orderTotal;
  const isValidTendered = parsedTendered >= orderTotal;

  // Payment method tabs configuration
  const paymentMethodTabs = useMemo<TypedTab<PaymentMethod>[]>(
    () => [
      {
        value: 'CASH',
        label: tPayments('cash'),
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        value: 'CREDIT_CARD',
        label: tPayments('billSplitting.card'),
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        value: 'MOBILE_PAYMENT',
        label: tPayments('billSplitting.mobile'),
        icon: <Smartphone className="h-4 w-4" />,
      },
    ],
    [tPayments]
  );

  // Record payment mutation using $api
  const paymentMutation = $api.useMutation('post', API_PATHS.recordPayment, {
    onSuccess: () => {
      toast.success(t('paymentSuccessful'));
      onPaymentSuccess();
    },
    onError: () => {
      toast.error(t('paymentFailed'));
    },
  });

  const handleSubmit = () => {
    if (paymentMethod === 'CASH' && !isValidTendered) {
      toast.error(t('insufficientAmount'));
      return;
    }

    const paymentData: RecordPaymentDto = {
      amount: orderTotal.toFixed(2),
      paymentMethod,
      ...(paymentMethod === 'CASH' &&
        amountTendered && { amountTendered: amountTendered }),
      ...(transactionId && { transactionId }),
      ...(notes && { notes }),
    };

    paymentMutation.mutate({
      params: { path: { orderId } },
      body: paymentData,
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={onBack}
            aria-label={t('backToCart')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg">{t('payment')}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {/* Order Total Display */}
        <div className="bg-muted mb-4 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">{t('orderTotal')}</p>
          <p className="text-primary text-3xl font-bold">
            {formatCurrency(orderTotal)}
          </p>
        </div>

        {/* Payment Method Tabs */}
        <TypedTabs
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          tabs={paymentMethodTabs}
          className="flex-1"
          listClassName="grid w-full grid-cols-3"
        >
          {/* Cash Payment */}
          <TabsContent value="CASH" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>{tPayments('amountTendered')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>

            {/* Quick Amount Buttons */}
            {quickAmounts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">
                  {tPayments('quickAmounts')}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      className="h-11"
                      onClick={() => setAmountTendered(amt.toString())}
                    >
                      {formatCurrency(amt)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Change Display */}
            {parsedTendered > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm">
                  {tPayments('change')}
                </p>
                <p
                  className={`text-2xl font-bold ${isValidTendered ? 'text-primary' : 'text-destructive'}`}
                >
                  {isValidTendered
                    ? formatCurrency(change)
                    : tPayments('insufficient')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Card Payment */}
          <TabsContent value="CREDIT_CARD" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>{tPayments('transactionId')}</Label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={tPayments('transactionIdPlaceholder')}
              />
            </div>
          </TabsContent>

          {/* Mobile Payment */}
          <TabsContent value="MOBILE_PAYMENT" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>{tPayments('transactionId')}</Label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={tPayments('transactionIdPlaceholder')}
              />
            </div>
          </TabsContent>
        </TypedTabs>

        {/* Notes */}
        <div className="mt-4 space-y-2">
          <Label>{tPayments('notes')}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tPayments('notesPlaceholder')}
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={
            paymentMutation.isPending ||
            (paymentMethod === 'CASH' && !isValidTendered)
          }
        >
          {paymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('processing')}
            </>
          ) : (
            t('confirmPayment')
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
