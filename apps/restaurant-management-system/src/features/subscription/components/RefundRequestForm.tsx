'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { Checkbox } from '@repo/ui/components/checkbox';
import { toast } from '@repo/ui/lib/toast';
import { useCreateRefundRequest } from '../hooks/useSubscription';
import type { Subscription, RefundReason } from '../types/subscription.types';

interface RefundRequestFormProps {
  storeId: string;
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
}

const refundSchema = z.object({
  reason: z.enum([
    'NOT_SATISFIED',
    'TECHNICAL_ISSUES',
    'FOUND_ALTERNATIVE',
    'OTHER',
  ]),
  comments: z.string().optional(),
  confirmDowngrade: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the tier downgrade',
  }),
});

type RefundFormValues = z.infer<typeof refundSchema>;

export function RefundRequestForm({
  storeId,
  subscription,
  open,
  onClose,
}: RefundRequestFormProps) {
  const t = useTranslations('subscription.refund');
  const createRefundRequest = useCreateRefundRequest();

  const isEligible = () => {
    if (!subscription.currentPeriodStart) return false;
    const activationDate = new Date(subscription.currentPeriodStart);
    const daysSinceActivation = Math.floor(
      (Date.now() - activationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceActivation <= 30;
  };

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: 'NOT_SATISFIED',
      comments: '',
      confirmDowngrade: false,
    },
  });

  const onSubmit = async (data: RefundFormValues) => {
    try {
      await createRefundRequest.mutateAsync({
        storeId,
        reason: data.reason as RefundReason,
        comments: data.comments,
      });
      toast.success(t('success'));
      form.reset();
      onClose();
    } catch {
      toast.error(t('error'));
    }
  };

  const eligible = isEligible();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {!eligible ? (
          <div className="bg-destructive/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-destructive h-5 w-5 shrink-0" />
              <div>
                <p className="text-destructive text-sm font-medium">
                  {t('notEligible')}
                </p>
                <p className="text-destructive/80 mt-1 text-sm">
                  {t('eligibilityWindow')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-lg border p-4 text-sm">
                <div className="mb-2 font-medium">{t('subscriptionInfo')}</div>
                <div className="text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>{t('tier')}</span>
                    <span className="text-foreground font-medium">
                      {t(`tiers.${subscription.tier}`)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('activatedOn')}</span>
                    <span className="text-foreground font-medium">
                      {subscription.currentPeriodStart &&
                        new Date(
                          subscription.currentPeriodStart
                        ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('amount')}</span>
                    <span className="text-foreground font-medium">
                      {subscription.tier === 'STANDARD'
                        ? '$240.00'
                        : '$1,200.00'}
                    </span>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('reasonLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NOT_SATISFIED">
                          {t('reasons.notSatisfied')}
                        </SelectItem>
                        <SelectItem value="TECHNICAL_ISSUES">
                          {t('reasons.technicalIssues')}
                        </SelectItem>
                        <SelectItem value="FOUND_ALTERNATIVE">
                          {t('reasons.foundAlternative')}
                        </SelectItem>
                        <SelectItem value="OTHER">
                          {t('reasons.other')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('commentsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('commentsPlaceholder')}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-amber-50 p-4">
                <div className="mb-2 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {t('warning')}
                    </p>
                    <p className="mt-1 text-sm text-amber-800">
                      {t('warningDescription')}
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="confirmDowngrade"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-amber-900">
                          {t('confirmDowngradeLabel')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={createRefundRequest.isPending}
                >
                  {createRefundRequest.isPending
                    ? t('submitting')
                    : t('submit')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
