'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, CreditCard, AlertCircle } from 'lucide-react';

import { $api } from '@/utils/apiFetch';

import type {
  OrderResponseDto,
  RecordPaymentDto,
} from '@repo/api/generated/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/lib/toast';
import { formatCurrency } from '@/utils/formatting';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderResponseDto;
  onSuccess?: () => void;
}

type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MOBILE_PAYMENT'
  | 'OTHER';

export function PaymentDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: PaymentDialogProps) {
  const t = useTranslations('payments');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [amountTendered, setAmountTendered] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate values
  const remainingBalance =
    Number(order.grandTotal) - (order.totalPaid ? Number(order.totalPaid) : 0);
  const parsedAmount = parseFloat(amount) || 0;
  const parsedTendered = parseFloat(amountTendered) || 0;
  const change = paymentMethod === 'CASH' ? parsedTendered - parsedAmount : 0;
  const isValidTendered =
    paymentMethod !== 'CASH' || parsedTendered >= parsedAmount;

  // Quick amount options based on remaining balance
  const quickAmounts = [20, 50, 100, 200, 500].filter(
    (amt) => amt >= parsedAmount
  );

  // Set default amount to remaining balance
  useEffect(() => {
    if (open && !amount) {
      setAmount(remainingBalance.toFixed(2));
    }
  }, [open, remainingBalance, amount]);

  // Record payment mutation using $api
  const recordPaymentMutation = $api.useMutation(
    'post',
    '/payments/orders/{orderId}',
    {
      onSuccess: () => {
        toast.success(t('paymentRecorded'), {
          description: t('paymentRecordedDesc'),
        });
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['payments', order.id] });
        onOpenChange(false);
        onSuccess?.();
        resetForm();
      },
      onError: () => {
        toast.error(tCommon('error'));
      },
    }
  );

  const resetForm = () => {
    setPaymentMethod('CASH');
    setAmount('');
    setAmountTendered('');
    setTransactionId('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!parsedAmount || parsedAmount <= 0) {
      toast.error(tCommon('error'), {
        description: t('invalidAmount'),
      });
      return;
    }

    if (parsedAmount > remainingBalance) {
      toast.error(tCommon('error'), {
        description: t('amountExceedsBalance'),
      });
      return;
    }

    if (paymentMethod === 'CASH' && !isValidTendered) {
      toast.error(tCommon('error'), {
        description: t('tenderedTooLow'),
      });
      return;
    }

    const paymentData: RecordPaymentDto = {
      amount: amount,
      paymentMethod,
      ...(paymentMethod === 'CASH' && amountTendered && { amountTendered }),
      ...(transactionId && { transactionId }),
      ...(notes && { notes }),
    };

    recordPaymentMutation.mutate({
      params: { path: { orderId: order.id } },
      body: paymentData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('recordPayment')}
          </DialogTitle>
          <DialogDescription>
            {t('recordPaymentDesc', {
              orderId: order.orderNumber || order.id.substring(0, 8),
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Order Summary */}
            <div className="bg-muted space-y-2 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('orderTotal')}</span>
                <span className="font-semibold">
                  {formatCurrency(order.grandTotal)}
                </span>
              </div>
              {order.totalPaid && Number(order.totalPaid) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('totalPaid')}
                  </span>
                  <span>{formatCurrency(order.totalPaid)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>{t('remainingBalance')}</span>
                <span className="text-primary">
                  {formatCurrency(remainingBalance.toFixed(2))}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">{t('paymentMethod')}</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">{t('cash')}</SelectItem>
                  <SelectItem value="CREDIT_CARD">{t('creditCard')}</SelectItem>
                  <SelectItem value="DEBIT_CARD">{t('debitCard')}</SelectItem>
                  <SelectItem value="MOBILE_PAYMENT">
                    {t('mobilePayment')}
                  </SelectItem>
                  <SelectItem value="OTHER">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t('amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <p className="text-muted-foreground text-xs">
                {t('maxAmount', {
                  amount: formatCurrency(remainingBalance.toFixed(2)),
                })}
              </p>
            </div>

            {/* Amount Tendered (Cash Only) */}
            {paymentMethod === 'CASH' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amountTendered">{t('amountTendered')}</Label>
                  <Input
                    id="amountTendered"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder="0.00"
                    required={paymentMethod === 'CASH'}
                    autoFocus
                  />
                </div>

                {/* Quick Amount Buttons */}
                {quickAmounts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      {t('quickAmounts')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountTendered(amt.toString())}
                          className="min-w-[80px] flex-1"
                        >
                          {formatCurrency(amt.toString())}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Change Display */}
                {parsedTendered > 0 && (
                  <div className="bg-muted flex items-center gap-2 rounded-lg border p-4">
                    <DollarSign className="h-6 w-6" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t('change')}</p>
                      <p className="text-3xl font-bold">
                        {isValidTendered
                          ? formatCurrency(change.toFixed(2))
                          : t('insufficient')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Underpayment Warning */}
                {parsedTendered > 0 && !isValidTendered && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('underpaymentWarning', {
                        shortfall: formatCurrency(
                          (parsedAmount - parsedTendered).toFixed(2)
                        ),
                      })}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Transaction ID (Non-Cash) */}
            {paymentMethod !== 'CASH' && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">{t('transactionId')}</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={t('transactionIdPlaceholder')}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={recordPaymentMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending || !isValidTendered}
            >
              {recordPaymentMutation.isPending
                ? t('recording')
                : t('recordPayment')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
