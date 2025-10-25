'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Textarea } from '@repo/ui/components/textarea';
import { Alert, AlertDescription } from '@repo/ui/components/alert';

import { createRefund } from '../services/payment.service';
import { updateOrderStatus } from '@/features/orders/services/order.service';

interface RefundVoidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  totalPaid: string;
}

const REFUND_REASONS = [
  'CUSTOMER_REQUEST',
  'WRONG_ORDER',
  'KITCHEN_ISSUE',
  'QUALITY_ISSUE',
  'OTHER',
] as const;

// Refund form schema
const refundSchema = z.object({
  refundType: z.enum(['FULL', 'PARTIAL']),
  amount: z.string().optional(),
  reason: z.enum(REFUND_REASONS),
  reasonText: z.string().optional(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this action',
  }),
});

// Void form schema
const voidSchema = z.object({
  reason: z.enum(REFUND_REASONS),
  reasonText: z.string().optional(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm this action',
  }),
});

type RefundFormValues = z.infer<typeof refundSchema>;
type VoidFormValues = z.infer<typeof voidSchema>;

export function RefundVoidDialog({
  open,
  onOpenChange,
  orderId,
  totalPaid,
}: RefundVoidDialogProps) {
  const t = useTranslations('payments.refundVoid');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'refund' | 'void'>('refund');

  const totalPaidNum = parseFloat(totalPaid);
  const isPaid = totalPaidNum > 0;

  // Refund form
  const refundForm = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      refundType: 'FULL',
      amount: totalPaid,
      reason: 'CUSTOMER_REQUEST',
      reasonText: '',
      confirmed: false,
    },
  });

  // Void form
  const voidForm = useForm<VoidFormValues>({
    resolver: zodResolver(voidSchema),
    defaultValues: {
      reason: 'CUSTOMER_REQUEST',
      reasonText: '',
      confirmed: false,
    },
  });

  const refundType = refundForm.watch('refundType');
  const refundReason = refundForm.watch('reason');
  const voidReason = voidForm.watch('reason');

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async (values: RefundFormValues) => {
      const refundAmount =
        values.refundType === 'FULL' ? totalPaid : values.amount || '0';
      const reason =
        values.reason === 'OTHER' ? values.reasonText : values.reason;

      return await createRefund(orderId, {
        amount: refundAmount,
        reason: reason || undefined,
      });
    },
    onSuccess: () => {
      toast.success(t('refundSuccess'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments', orderId] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('refundFailed'));
    },
  });

  // Void mutation
  const voidMutation = useMutation({
    mutationFn: async () => {
      return await updateOrderStatus(orderId, { status: 'CANCELLED' });
    },
    onSuccess: () => {
      toast.success(t('voidSuccess'));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('voidFailed'));
    },
  });

  const handleRefundSubmit = async (values: RefundFormValues) => {
    // Validate partial refund amount
    if (values.refundType === 'PARTIAL') {
      const amount = parseFloat(values.amount || '0');
      if (amount <= 0 || amount > totalPaidNum) {
        toast.error(t('invalidRefundAmount'));
        return;
      }
    }

    await refundMutation.mutateAsync(values);
  };

  const handleVoidSubmit = async (values: VoidFormValues) => {
    await voidMutation.mutateAsync();
  };

  // Reset forms when dialog opens
  useEffect(() => {
    if (open) {
      refundForm.reset({
        refundType: 'FULL',
        amount: totalPaid,
        reason: 'CUSTOMER_REQUEST',
        reasonText: '',
        confirmed: false,
      });
      voidForm.reset({
        reason: 'CUSTOMER_REQUEST',
        reasonText: '',
        confirmed: false,
      });
      // Set initial tab based on payment status
      setActiveTab(isPaid ? 'refund' : 'void');
    }
  }, [open, totalPaid, isPaid, refundForm, voidForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'refund' | 'void')}
        >
          <TabsList className="grid w-full grid-cols-2">
            {isPaid && (
              <TabsTrigger value="refund">{t('refundTab')}</TabsTrigger>
            )}
            {!isPaid && <TabsTrigger value="void">{t('voidTab')}</TabsTrigger>}
            {isPaid && <TabsTrigger value="void">{t('voidTab')}</TabsTrigger>}
          </TabsList>

          {isPaid && (
            <TabsContent value="refund">
              <Form {...refundForm}>
                <form
                  onSubmit={refundForm.handleSubmit(handleRefundSubmit)}
                  className="space-y-4"
                >
                  {/* Refund Type */}
                  <FormField
                    control={refundForm.control}
                    name="refundType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t('refundType')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="FULL" id="full" />
                              <label
                                htmlFor="full"
                                className="cursor-pointer text-sm"
                              >
                                {t('fullRefund')} ({totalPaid})
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="PARTIAL" id="partial" />
                              <label
                                htmlFor="partial"
                                className="cursor-pointer text-sm"
                              >
                                {t('partialRefund')}
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Partial Amount */}
                  {refundType === 'PARTIAL' && (
                    <FormField
                      control={refundForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('refundAmount')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              max={totalPaid}
                            />
                          </FormControl>
                          <p className="text-muted-foreground text-xs">
                            {t('maxRefundAmount', { max: totalPaid })}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Reason Dropdown */}
                  <FormField
                    control={refundForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('reason')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectReason')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REFUND_REASONS.map((reason) => (
                              <SelectItem key={reason} value={reason}>
                                {t(`reasons.${reason}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reason Text (if OTHER) */}
                  {refundReason === 'OTHER' && (
                    <FormField
                      control={refundForm.control}
                      name="reasonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('reasonDetails')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('enterReasonDetails')}
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Confirmation Checkbox */}
                  <FormField
                    control={refundForm.control}
                    name="confirmed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            {t('confirmRefund')}
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={refundMutation.isPending}>
                      {refundMutation.isPending
                        ? t('processing')
                        : t('confirmRefundButton')}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          )}

          <TabsContent value="void">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{t('voidWarning')}</AlertDescription>
            </Alert>

            <Form {...voidForm}>
              <form
                onSubmit={voidForm.handleSubmit(handleVoidSubmit)}
                className="space-y-4"
              >
                {/* Reason Dropdown */}
                <FormField
                  control={voidForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reason')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectReason')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REFUND_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {t(`reasons.${reason}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reason Text (if OTHER) */}
                {voidReason === 'OTHER' && (
                  <FormField
                    control={voidForm.control}
                    name="reasonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('reasonDetails')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('enterReasonDetails')}
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Confirmation Checkbox */}
                <FormField
                  control={voidForm.control}
                  name="confirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {t('confirmVoid')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

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
                    variant="destructive"
                    disabled={voidMutation.isPending}
                  >
                    {voidMutation.isPending
                      ? t('processing')
                      : t('confirmVoidButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
