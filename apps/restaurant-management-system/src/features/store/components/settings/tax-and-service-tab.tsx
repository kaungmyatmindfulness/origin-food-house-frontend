'use client';

import { Loader2, Percent } from 'lucide-react';
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
  CardFooter,
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStoreSettings } from '../../services/store.service';
import type { UpdateStoreSettingDto } from '../../types/store.types';
import type { ApiError } from '@/utils/apiFetch';

const percentageRateSchema = z.preprocess(
  (val) =>
    val === '' || val === null || val === undefined ? null : Number(val),
  z
    .number({ invalid_type_error: 'Must be a number (e.g., 7 for 7%)' })
    .min(0, 'Rate cannot be negative.')
    .max(30, 'Rate must be 30% or less.')
    .nullable()
    .optional()
);

const formatPercentageRateForApi = (
  percentageRate: number | null | undefined
): string | null => {
  if (percentageRate === null || percentageRate === undefined) return null;

  const decimalRate = Number(percentageRate) / 100;
  if (isNaN(decimalRate) || decimalRate < 0 || decimalRate > 0.3) {
    return null;
  }
  return decimalRate.toFixed(4);
};

const taxAndServiceSchema = z.object({
  vatRate: percentageRateSchema,
  serviceChargeRate: percentageRateSchema,
});

type TaxAndServiceFormData = z.infer<typeof taxAndServiceSchema>;

interface TaxAndServiceTabProps {
  storeId: string;
  vatRate?: string | null;
  serviceChargeRate?: string | null;
  onSuccess?: () => void;
}

const parseApiRateToPercentage = (
  rateString: string | null | undefined
): number | undefined => {
  if (rateString === null || rateString === undefined) return undefined;
  const decimalRate = parseFloat(rateString);
  if (!isNaN(decimalRate) && decimalRate >= 0 && decimalRate <= 1) {
    return parseFloat((decimalRate * 100).toFixed(2));
  }
  return undefined;
};

export function TaxAndServiceTab({
  storeId,
  vatRate,
  serviceChargeRate,
  onSuccess,
}: TaxAndServiceTabProps) {
  const t = useTranslations('store.settingsPage.taxAndService');
  const queryClient = useQueryClient();

  const form = useForm<TaxAndServiceFormData>({
    resolver: zodResolver(taxAndServiceSchema),
    defaultValues: {
      vatRate: parseApiRateToPercentage(vatRate),
      serviceChargeRate: parseApiRateToPercentage(serviceChargeRate),
    },
  });

  const updateMutation = useMutation<
    unknown,
    ApiError | Error,
    UpdateStoreSettingDto
  >({
    mutationFn: async (data: UpdateStoreSettingDto) => {
      return updateStoreSettings(storeId, data);
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to update tax and service:', error);
      toast.error(t('updateError'));
    },
  });

  function onSubmit(values: TaxAndServiceFormData) {
    const vatRate = formatPercentageRateForApi(values.vatRate);
    const serviceChargeRate = formatPercentageRateForApi(
      values.serviceChargeRate
    );

    const apiData: UpdateStoreSettingDto = {
      vatRate: vatRate ?? undefined,
      serviceChargeRate: serviceChargeRate ?? undefined,
    };

    updateMutation.mutate(apiData);
  }

  // Calculate preview
  const exampleSubtotal = 1000;
  const vatRateValue = form.watch('vatRate') || 0;
  const serviceChargeRateValue = form.watch('serviceChargeRate') || 0;
  const vatAmount = (exampleSubtotal * vatRateValue) / 100;
  const serviceChargeAmount = (exampleSubtotal * serviceChargeRateValue) / 100;
  const grandTotal = exampleSubtotal + vatAmount + serviceChargeAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vatLabel')}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="30"
                        placeholder={t('vatPlaceholder')}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <Percent
                      className="text-muted-foreground h-4 w-4"
                      aria-hidden="true"
                    />
                  </div>
                  <FormDescription>{t('vatDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceChargeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('serviceChargeLabel')}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="30"
                        placeholder={t('serviceChargePlaceholder')}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <Percent
                      className="text-muted-foreground h-4 w-4"
                      aria-hidden="true"
                    />
                  </div>
                  <FormDescription>
                    {t('serviceChargeDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Calculation */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <h4 className="mb-3 font-medium">{t('previewTitle')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>{exampleSubtotal.toFixed(2)}</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>
                    {t('vat')} ({vatRateValue}%)
                  </span>
                  <span>+{vatAmount.toFixed(2)}</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>
                    {t('serviceCharge')} ({serviceChargeRateValue}%)
                  </span>
                  <span>+{serviceChargeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>{t('total')}</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !form.formState.isDirty}
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('save')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
