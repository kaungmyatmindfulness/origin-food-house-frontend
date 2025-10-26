'use client';

import { Loader2, Crown, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@repo/ui/lib/toast';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Switch } from '@repo/ui/components/switch';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { ApiError } from '@/utils/apiFetch';

const loyaltyProgramSchema = z.object({
  enabled: z.boolean(),
  pointRate: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Must be a number' })
      .min(0, 'Rate cannot be negative')
      .max(1, 'Rate must be 1 or less')
      .nullable()
      .optional()
  ),
  redemptionRate: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Must be a number' })
      .min(0, 'Rate cannot be negative')
      .max(100, 'Rate must be 100 or less')
      .nullable()
      .optional()
  ),
  expiryDays: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be a whole number')
      .min(0, 'Days cannot be negative')
      .max(3650, 'Maximum 3650 days (10 years)')
      .nullable()
      .optional()
  ),
});

type LoyaltyProgramFormData = z.infer<typeof loyaltyProgramSchema>;

interface LoyaltyProgramTabProps {
  storeId: string;
  storeTier: 'FREE' | 'STANDARD' | 'PREMIUM';
  enabled?: boolean;
  pointRate?: string | null;
  redemptionRate?: string | null;
  expiryDays?: number | null;
  onSuccess?: () => void;
}

export function LoyaltyProgramTab({
  storeId,
  storeTier,
  enabled = false,
  pointRate,
  redemptionRate,
  expiryDays,
  onSuccess,
}: LoyaltyProgramTabProps) {
  const t = useTranslations('store.settingsPage.loyalty');
  const queryClient = useQueryClient();

  const isFreeTier = storeTier === 'FREE';

  const form = useForm<LoyaltyProgramFormData>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: {
      enabled: enabled && !isFreeTier,
      pointRate: pointRate ? parseFloat(pointRate) : 0.1,
      redemptionRate: redemptionRate ? parseFloat(redemptionRate) : 0.1,
      expiryDays: expiryDays ?? 365,
    },
  });

  const updateMutation = useMutation<
    unknown,
    ApiError | Error,
    LoyaltyProgramFormData
  >({
    mutationFn: async (data: LoyaltyProgramFormData) => {
      const apiData = {
        pointRate: data.pointRate?.toString() || null,
        redemptionRate: data.redemptionRate?.toString() || null,
        expiryDays: data.expiryDays || null,
      };

      const res = await apiFetch(`/stores/${storeId}/settings/loyalty-rules`, {
        method: 'PATCH',
        body: JSON.stringify(apiData),
      });

      return unwrapData(res, 'Failed to update loyalty rules');
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] });
      form.reset(form.getValues()); // Reset dirty state
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to update loyalty rules:', error);
      toast.error(t('updateError'));
    },
  });

  function onSubmit(values: LoyaltyProgramFormData) {
    if (isFreeTier) {
      toast.error(t('tierRestriction'));
      return;
    }
    updateMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Restriction Warning */}
        {isFreeTier && (
          <Alert
            variant="default"
            className="border-amber-500 bg-amber-50 dark:bg-amber-950"
          >
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              {t('premiumFeature')}
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {t('tierRestriction')}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Enable Toggle */}
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('enable')}</FormLabel>
                      <FormDescription>
                        {t('enableDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isFreeTier || updateMutation.isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Point Rate */}
              <FormField
                control={form.control}
                name="pointRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pointRate')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="0.1"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isFreeTier || updateMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('pointRateDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Redemption Rate */}
              <FormField
                control={form.control}
                name="redemptionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('redemptionRate')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.1"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isFreeTier || updateMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('redemptionRateDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiry Days */}
              <FormField
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('expiryDays')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="3650"
                        placeholder="365"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isFreeTier || updateMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('expiryDaysDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  disabled={
                    isFreeTier ||
                    updateMutation.isPending ||
                    !form.formState.isDirty
                  }
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
