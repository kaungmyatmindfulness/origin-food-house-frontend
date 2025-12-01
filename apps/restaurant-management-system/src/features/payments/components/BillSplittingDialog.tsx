'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  TypedRadioGroup,
  type TypedRadioGroupOption,
} from '@repo/ui/components/typed-radio-group';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Alert, AlertDescription } from '@repo/ui/components/alert';

import { $api } from '@/utils/apiFetch';

import type {
  OrderResponseDto,
  RecordPaymentDto,
} from '@repo/api/generated/types';

interface BillSplittingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  order: OrderResponseDto;
}

type SplitMethod = 'EQUAL' | 'CUSTOM' | 'BY_ITEM';

interface Diner {
  id: string;
  amount: string;
  paid: boolean;
  paymentMethod?:
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'MOBILE_PAYMENT'
    | 'OTHER';
}

const equalSplitSchema = z.object({
  numberOfDiners: z
    .number()
    .min(2, 'Must have at least 2 diners')
    .max(20, 'Max 20 diners'),
});

type EqualSplitFormValues = z.infer<typeof equalSplitSchema>;

export function BillSplittingDialog({
  open,
  onOpenChange,
  orderId,
  order,
}: BillSplittingDialogProps) {
  const t = useTranslations('payments.billSplitting');
  const queryClient = useQueryClient();

  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');
  const [diners, setDiners] = useState<Diner[]>([]);
  const [currentDinerIndex, setCurrentDinerIndex] = useState<number | null>(
    null
  );
  const [isRecordingPayments, setIsRecordingPayments] = useState(false);

  const grandTotal = parseFloat(order.grandTotal);

  // Equal split form
  const equalForm = useForm<EqualSplitFormValues>({
    resolver: zodResolver(equalSplitSchema),
    defaultValues: {
      numberOfDiners: 2,
    },
  });

  const numberOfDiners = equalForm.watch('numberOfDiners');

  // Calculate splits
  useEffect(() => {
    if (splitMethod === 'EQUAL' && numberOfDiners >= 2) {
      const baseAmount = Math.floor((grandTotal * 100) / numberOfDiners) / 100;
      const remainder =
        Math.round((grandTotal - baseAmount * numberOfDiners) * 100) / 100;

      const newDiners: Diner[] = Array.from(
        { length: numberOfDiners },
        (_, i) => ({
          id: `diner-${i + 1}`,
          amount:
            i === numberOfDiners - 1
              ? (baseAmount + remainder).toFixed(2) // Last diner gets remainder
              : baseAmount.toFixed(2),
          paid: false,
        })
      );

      setDiners(newDiners);
    }
  }, [splitMethod, numberOfDiners, grandTotal]);

  // Custom split: Calculate balance
  const calculateBalance = () => {
    const totalPaid = diners.reduce(
      (sum, d) => sum + parseFloat(d.amount || '0'),
      0
    );
    const remaining = grandTotal - totalPaid;
    return {
      totalPaid: totalPaid.toFixed(2),
      remaining: remaining.toFixed(2),
      isBalanced: Math.abs(remaining) < 0.01, // Allow 1 cent tolerance
      isOverpaid: remaining < -0.01,
      isUnderpaid: remaining > 0.01,
    };
  };

  const balance = splitMethod === 'CUSTOM' ? calculateBalance() : null;

  // Add diner (custom split)
  const handleAddDiner = () => {
    setDiners([
      ...diners,
      { id: `diner-${diners.length + 1}`, amount: '0.00', paid: false },
    ]);
  };

  // Remove diner (custom split)
  const handleRemoveDiner = (index: number) => {
    setDiners(diners.filter((_, i) => i !== index));
  };

  // Update diner amount (custom split)
  const handleDinerAmountChange = (index: number, value: string) => {
    const newDiners = [...diners];
    if (newDiners[index]) {
      newDiners[index].amount = value;
      setDiners(newDiners);
    }
  };

  // Payment recording mutation using $api
  const paymentMutation = $api.useMutation(
    'post',
    '/payments/orders/{orderId}',
    {
      onSuccess: () => {
        if (currentDinerIndex === null) return;

        const dinerIndex = currentDinerIndex;
        const newDiners = [...diners];
        if (newDiners[dinerIndex]) {
          newDiners[dinerIndex].paid = true;
        }
        setDiners(newDiners);

        toast.success(t('paymentRecorded', { diner: dinerIndex + 1 }));

        // Check if all diners paid
        const allPaid = newDiners.every((d) => d.paid);
        if (allPaid) {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['payments', orderId] });
          toast.success(t('allPaymentsRecorded'));
          setTimeout(() => {
            onOpenChange(false);
          }, 1000);
        } else {
          setCurrentDinerIndex(null);
        }
      },
      onError: () => {
        toast.error(t('paymentFailed'));
      },
    }
  );

  // Start recording payments
  const handleProceedToPayments = () => {
    if (splitMethod === 'CUSTOM' && !balance?.isBalanced) {
      toast.error(t('balanceRequired'));
      return;
    }
    setIsRecordingPayments(true);
    setCurrentDinerIndex(0);
  };

  // Record payment for current diner
  const handleRecordPayment = async (
    dinerIndex: number,
    paymentMethod: string
  ) => {
    const diner = diners[dinerIndex];
    if (!diner) return;

    const paymentData: RecordPaymentDto = {
      amount: diner.amount,
      paymentMethod: paymentMethod as RecordPaymentDto['paymentMethod'],
    };

    await paymentMutation.mutateAsync({
      params: { path: { orderId } },
      body: paymentData,
    });
  };

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSplitMethod('EQUAL');
      setDiners([]);
      setCurrentDinerIndex(null);
      setIsRecordingPayments(false);
      equalForm.reset({ numberOfDiners: 2 });
    }
  }, [open, equalForm]);

  // Progress tracking
  const paidDiners = diners.filter((d) => d.paid).length;
  const totalDiners = diners.length;

  // Split method options for TypedRadioGroup
  const splitMethodOptions = useMemo<TypedRadioGroupOption<SplitMethod>[]>(
    () => [
      { value: 'EQUAL', label: t('equalSplit') },
      { value: 'CUSTOM', label: t('customAmounts') },
      {
        value: 'BY_ITEM',
        label: t('byItem'),
        description: t('comingSoon'),
        disabled: true,
      },
    ],
    [t]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')} - {t('total')}: {order.grandTotal}
          </DialogDescription>
        </DialogHeader>

        {!isRecordingPayments ? (
          <div className="space-y-6">
            {/* Split Method Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('splitMethod')}</label>
              <TypedRadioGroup
                value={splitMethod}
                onValueChange={setSplitMethod}
                options={splitMethodOptions}
              />
            </div>

            {/* Equal Split UI */}
            {splitMethod === 'EQUAL' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('equalSplitTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...equalForm}>
                    <FormField
                      control={equalForm.control}
                      name="numberOfDiners"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('numberOfDiners')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              max={20}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 2)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>

                  {diners.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {t('perPersonShare')}
                      </p>
                      {diners.map((diner, i) => (
                        <div
                          key={diner.id}
                          className="bg-muted flex items-center justify-between rounded p-2"
                        >
                          <span className="text-sm">
                            {t('diner')} {i + 1}
                          </span>
                          <span className="font-medium">{diner.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Custom Split UI */}
            {splitMethod === 'CUSTOM' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('customSplitTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {diners.map((diner, i) => (
                      <div key={diner.id} className="flex items-center gap-2">
                        <span className="w-20 text-sm">
                          {t('diner')} {i + 1}
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t('amountPlaceholder')}
                          value={diner.amount}
                          onChange={(e) =>
                            handleDinerAmountChange(i, e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDiner(i)}
                          disabled={diners.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDiner}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addDiner')}
                  </Button>

                  {/* Balance Display */}
                  {balance && (
                    <div className="bg-muted space-y-2 rounded p-3">
                      <div className="flex justify-between text-sm">
                        <span>{t('totalEntered')}</span>
                        <span className="font-medium">{balance.totalPaid}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('remaining')}</span>
                        <span
                          className={`font-medium ${
                            balance.isBalanced
                              ? 'text-green-600'
                              : balance.isOverpaid
                                ? 'text-red-600'
                                : 'text-yellow-600'
                          }`}
                        >
                          {balance.remaining}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>{t('status')}</span>
                        <Badge
                          variant={
                            balance.isBalanced
                              ? 'default'
                              : balance.isOverpaid
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {balance.isBalanced
                            ? t('balanced')
                            : balance.isOverpaid
                              ? t('overpaid')
                              : t('underpaid')}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleProceedToPayments}
                disabled={
                  diners.length === 0 ||
                  (splitMethod === 'CUSTOM' && !balance?.isBalanced)
                }
              >
                {t('proceedToPayments')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <Alert>
              <AlertDescription>
                {t('paymentProgress', { paid: paidDiners, total: totalDiners })}
              </AlertDescription>
            </Alert>

            {/* Payment Recording */}
            <div className="space-y-4">
              {diners.map((diner, i) => (
                <Card key={diner.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {t('diner')} {i + 1}
                        </p>
                        <p className="text-2xl font-bold">{diner.amount}</p>
                      </div>

                      {diner.paid ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {t('paid')}
                        </Badge>
                      ) : currentDinerIndex === i ? (
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm">
                            {t('selectPaymentMethod')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRecordPayment(i, 'CASH')}
                              disabled={paymentMutation.isPending}
                            >
                              {t('cash')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRecordPayment(i, 'CREDIT_CARD')
                              }
                              disabled={paymentMutation.isPending}
                            >
                              {t('card')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRecordPayment(i, 'MOBILE_PAYMENT')
                              }
                              disabled={paymentMutation.isPending}
                            >
                              {t('mobile')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary">{t('pending')}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRecordingPayments(false);
                  setCurrentDinerIndex(null);
                }}
              >
                {t('backToSplit')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
