'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Textarea } from '@repo/ui/components/textarea';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

import type { OrderResponseDto } from '@repo/api/generated/types';
import { applyDiscount } from '../services/discount.service';

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  order: OrderResponseDto;
}

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

const discountSchema = z.object({
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  percentageValue: z.number().min(0).max(100).optional(),
  amountValue: z.number().min(0).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

export function DiscountDialog({
  open,
  onOpenChange,
  orderId,
  order,
}: DiscountDialogProps) {
  const t = useTranslations('payments.discounts');
  const queryClient = useQueryClient();

  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [newSubtotal, setNewSubtotal] = useState<number>(0);

  const subtotal = parseFloat(order.subTotal || '0');

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discountType: 'PERCENTAGE',
      percentageValue: 0,
      amountValue: 0,
      reason: '',
    },
  });

  const percentageValue = form.watch('percentageValue');
  const amountValue = form.watch('amountValue');

  // Calculate discount amount and new subtotal
  useEffect(() => {
    let calculatedDiscount = 0;

    if (discountType === 'PERCENTAGE' && percentageValue) {
      calculatedDiscount = (subtotal * percentageValue) / 100;
    } else if (discountType === 'FIXED_AMOUNT' && amountValue) {
      calculatedDiscount = amountValue;
    }

    setDiscountAmount(calculatedDiscount);
    setNewSubtotal(Math.max(0, subtotal - calculatedDiscount));
  }, [discountType, percentageValue, amountValue, subtotal]);

  // Determine approval level
  const getApprovalLevel = (): {
    level: 'NONE' | 'ADMIN' | 'OWNER';
    message: string;
  } => {
    if (discountType === 'PERCENTAGE' && percentageValue) {
      if (percentageValue > 50) {
        return { level: 'OWNER', message: t('ownerApprovalRequired') };
      } else if (percentageValue >= 10 && percentageValue <= 50) {
        return { level: 'ADMIN', message: t('adminApprovalRequired') };
      }
    } else if (discountType === 'FIXED_AMOUNT' && amountValue) {
      const percentage = (amountValue / subtotal) * 100;
      if (percentage > 50) {
        return { level: 'OWNER', message: t('ownerApprovalRequired') };
      } else if (percentage >= 10 && percentage <= 50) {
        return { level: 'ADMIN', message: t('adminApprovalRequired') };
      }
    }

    return { level: 'NONE', message: '' };
  };

  const approvalInfo = getApprovalLevel();

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: async (data: DiscountFormValues) => {
      return await applyDiscount(orderId, {
        discountType: data.discountType,
        percentageValue: data.percentageValue?.toString(),
        amountValue: data.amountValue?.toString(),
        reason: data.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success(t('discountApplied'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('failedToApply'));
    },
  });

  const handleSubmit = async (data: DiscountFormValues) => {
    // Validate that at least one value is provided
    if (
      discountType === 'PERCENTAGE' &&
      (!data.percentageValue || data.percentageValue <= 0)
    ) {
      toast.error(t('invalidPercentage'));
      return;
    }

    if (
      discountType === 'FIXED_AMOUNT' &&
      (!data.amountValue || data.amountValue <= 0)
    ) {
      toast.error(t('invalidAmount'));
      return;
    }

    await applyDiscountMutation.mutateAsync(data);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDiscountType('PERCENTAGE');
      form.reset({
        discountType: 'PERCENTAGE',
        percentageValue: 0,
        amountValue: 0,
        reason: '',
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('applyDiscount')}</DialogTitle>
          <DialogDescription>
            {t('orderSubtotal', {
              orderId: orderId.slice(0, 8),
              subtotal: order.subTotal,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Discount Type Selector */}
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('discountType')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={discountType}
                      onValueChange={(v) => {
                        setDiscountType(v as DiscountType);
                        field.onChange(v);
                      }}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PERCENTAGE" id="percentage" />
                        <label
                          htmlFor="percentage"
                          className="cursor-pointer text-sm"
                        >
                          {t('percentage')}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FIXED_AMOUNT" id="fixedAmount" />
                        <label
                          htmlFor="fixedAmount"
                          className="cursor-pointer text-sm"
                        >
                          {t('fixedAmount')}
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Percentage Input */}
            {discountType === 'PERCENTAGE' && (
              <FormField
                control={form.control}
                name="percentageValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('percentageValue')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder={t('percentagePlaceholder')}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Fixed Amount Input */}
            {discountType === 'FIXED_AMOUNT' && (
              <FormField
                control={form.control}
                name="amountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('amountValue')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={subtotal}
                        placeholder={t('amountPlaceholder')}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reason')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('reasonPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('discountAmount')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('originalSubtotal')}</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>
                    {t('discount')} (
                    {discountType === 'PERCENTAGE'
                      ? `${percentageValue || 0}%`
                      : t('fixed')}
                    )
                  </span>
                  <span className="font-medium">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>{t('newSubtotal')}</span>
                  <span>${newSubtotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Approval Alert */}
            {approvalInfo.level !== 'NONE' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{approvalInfo.message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  applyDiscountMutation.isPending || discountAmount <= 0
                }
              >
                {applyDiscountMutation.isPending
                  ? t('applying')
                  : t('applyDiscount')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
