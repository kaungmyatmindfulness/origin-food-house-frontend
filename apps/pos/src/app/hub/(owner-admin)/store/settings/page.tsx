'use client';
import { Loader2, Percent } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  getStoreDetails,
  updateStoreSettings,
} from '@/features/store/services/store.service';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Skeleton } from '@repo/ui/components/skeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  GetStoreDetailsResponseDto,
  UpdateStoreSettingDto,
  StoreSettingResponseDto,
} from '@/features/store/types/store.types';
import type { ApiError } from '@/utils/apiFetch';

const availableCurrencies = [
  'THB',
  'MMK',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'AUD',
  'CAD',
  'NZD',
  'SGD',
  'HKD',
  'INR',
  'IDR',
  'PHP',
  'MYR',
  'VND',
  'PKR',
  'BDT',
  'AED',
  'SAR',
] as const;

export const StoreCurrencyEnum = z.enum(availableCurrencies);
export type StoreCurrency = z.infer<typeof StoreCurrencyEnum>;

const percentageRateSchema = z.preprocess(
  (val) =>
    val === '' || val === null || val === undefined ? null : Number(val),
  z
    .number({ invalid_type_error: 'Must be a number (e.g., 7 for 7%)' })
    .min(0, 'Rate cannot be negative.')
    .max(99.999, 'Rate must be less than 100 (e.g., 7 for 7%).')
    .nullable()
    .optional()
);

const formatPercentageRateForApi = (
  percentageRate: number | null | undefined
): string | null => {
  if (percentageRate === null || percentageRate === undefined) return null;

  const decimalRate = Number(percentageRate) / 100;
  if (isNaN(decimalRate) || decimalRate < 0 || decimalRate >= 1) {
    return null;
  }
  return decimalRate.toFixed(2);
};

export const updateStoreSettingsSchema = z.object({
  currency: StoreCurrencyEnum,
  vatRate: percentageRateSchema,
  serviceChargeRate: percentageRateSchema,
});

export type UpdateStoreSettingsFormData = z.infer<
  typeof updateStoreSettingsSchema
>;

const parseApiRateToPercentage = (
  rateString: string | null | undefined
): number | undefined => {
  if (rateString === null || rateString === undefined) return undefined;
  const decimalRate = parseFloat(rateString);
  if (!isNaN(decimalRate) && decimalRate >= 0 && decimalRate < 1) {
    return parseFloat((decimalRate * 100).toFixed(2));
  }
  return undefined;
};

const storeDetailsQueryKey = (storeId: string | null) => [
  'storeDetails',
  storeId,
];

export default function UpdateStoreSettingsPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const {
    data: storeDetails,
    isLoading: isLoadingStore,
    isError,
    error,
  } = useQuery<GetStoreDetailsResponseDto | null, Error>({
    queryKey: storeDetailsQueryKey(selectedStoreId),
    queryFn: async () => {
      if (!selectedStoreId) return null;
      return getStoreDetails(selectedStoreId);
    },
    enabled: !!selectedStoreId,
    refetchOnWindowFocus: false,
  });

  const form = useForm<UpdateStoreSettingsFormData>({
    resolver: zodResolver(updateStoreSettingsSchema),
    defaultValues: {
      currency: undefined,
      vatRate: undefined,
      serviceChargeRate: undefined,
    },
  });

  useEffect(() => {
    if (storeDetails?.setting) {
      const settings = storeDetails.setting;

      const resetData: UpdateStoreSettingsFormData = {
        currency: settings.currency as UpdateStoreSettingsFormData['currency'],
        vatRate: parseApiRateToPercentage(settings.vatRate),
        serviceChargeRate: parseApiRateToPercentage(settings.serviceChargeRate),
      };

      form.reset(resetData);
      console.log('Form reset with percentage values:', resetData);
    }
  }, [storeDetails, form.reset, form]);

  const updateSettingsMutation = useMutation<
    StoreSettingResponseDto,
    ApiError | Error,
    UpdateStoreSettingDto
  >({
    mutationFn: async (data: UpdateStoreSettingDto) => {
      if (!selectedStoreId) throw new Error('Store not selected');
      return updateStoreSettings(selectedStoreId, data);
    },
    onSuccess: (updatedSettings) => {
      toast.success('Store settings updated successfully!');
      queryClient.invalidateQueries({
        queryKey: storeDetailsQueryKey(selectedStoreId),
      });
      const resetData: UpdateStoreSettingsFormData = {
        currency: updatedSettings.currency as StoreCurrency,
        vatRate: parseApiRateToPercentage(updatedSettings.vatRate),
        serviceChargeRate: parseApiRateToPercentage(
          updatedSettings.serviceChargeRate
        ),
      };
      form.reset(resetData);
    },
    onError: (error) => {
      console.error('Failed to update store settings:', error);
    },
  });

  function onSubmit(values: UpdateStoreSettingsFormData) {
    if (!selectedStoreId) {
      toast.error('Cannot update: Store not selected.');
      return;
    }

    const apiData: UpdateStoreSettingDto = {
      currency: values.currency ?? undefined,
      vatRate: formatPercentageRateForApi(values.vatRate),
      serviceChargeRate: formatPercentageRateForApi(values.serviceChargeRate),
    };

    updateSettingsMutation.mutate(apiData);
  }

  if (isLoadingStore) {
    return (
      <div className="space-y-4 p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isError || !storeDetails) {
    return (
      <div className="text-destructive p-6 text-center">
        <p>Error loading store settings.</p>
        {error instanceof Error && <p className="text-sm">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage currency, tax, and service charge settings.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>
            Configure how prices and totals are calculated and displayed.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        if (e === '') return;
                        field.onChange(e);
                      }}
                      value={field.value ?? ''}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {StoreCurrencyEnum.options.map((currencyCode) => (
                          <SelectItem key={currencyCode} value={currencyCode}>
                            {currencyCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The primary currency used for pricing and transactions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Rate (%)</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="99.999"
                          placeholder="e.g., 7 or 7.5"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          disabled={updateSettingsMutation.isPending}
                        />
                      </FormControl>
                      <Percent
                        className="text-muted-foreground h-4 w-4"
                        aria-hidden="true"
                      />
                    </div>
                    <FormDescription>
                      Enter percentage (e.g., 7 for 7%, 10.5 for 10.5%). Leave
                      empty or 0 if no VAT.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceChargeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge Rate (%)</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="99.999"
                          placeholder="e.g., 10 or 5.5"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          disabled={updateSettingsMutation.isPending}
                        />
                      </FormControl>
                      <Percent
                        className="text-muted-foreground h-4 w-4"
                        aria-hidden="true"
                      />
                    </div>
                    <FormDescription>
                      Enter percentage (e.g., 10 for 10%). Leave empty or 0 for
                      no service charge.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4 dark:border-gray-700">
              <Button
                type="submit"
                disabled={
                  updateSettingsMutation.isPending || !form.formState.isDirty
                }
              >
                {updateSettingsMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
