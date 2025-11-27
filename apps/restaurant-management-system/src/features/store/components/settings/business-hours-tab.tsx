'use client';

import { Loader2 } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Switch } from '@repo/ui/components/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/utils/apiFetch';

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
});

const businessHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;

interface BusinessHoursTabProps {
  storeId: string;
  initialHours?: BusinessHoursFormData;
  onSuccess?: () => void;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const defaultDayHours = {
  closed: false,
  open: '09:00',
  close: '22:00',
};

export function BusinessHoursTab({
  storeId,
  initialHours,
  onSuccess,
}: BusinessHoursTabProps) {
  const t = useTranslations('store.settingsPage.businessHours');
  const queryClient = useQueryClient();

  const form = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: initialHours || {
      monday: defaultDayHours,
      tuesday: defaultDayHours,
      wednesday: defaultDayHours,
      thursday: defaultDayHours,
      friday: defaultDayHours,
      saturday: defaultDayHours,
      sunday: defaultDayHours,
    },
  });

  const updateMutation = useMutation<
    unknown,
    ApiError | Error,
    BusinessHoursFormData
  >({
    mutationFn: async (formData: BusinessHoursFormData) => {
      const { data, error, response } = await apiClient.PATCH(
        '/stores/{id}/settings/business-hours',
        {
          params: { path: { id: storeId } },
          body: formData,
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to update business hours',
          response.status
        );
      }

      return data.data;
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] });
      form.reset(form.getValues()); // Reset dirty state
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to update business hours:', error);
      toast.error(t('updateError'));
    },
  });

  function onSubmit(values: BusinessHoursFormData) {
    updateMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {DAYS.map((day) => {
              const isClosed = form.watch(`${day}.closed`);

              return (
                <div
                  key={day}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[100px]">
                      <span className="font-medium capitalize">{t(day)}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name={`${day}.closed`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormLabel className="text-sm font-normal">
                            {t('closed')}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={updateMutation.isPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!isClosed && (
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`${day}.open`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormLabel className="text-sm font-normal whitespace-nowrap">
                              {t('openTime')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={updateMutation.isPending}
                                className="w-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="text-muted-foreground">-</span>
                      <FormField
                        control={form.control}
                        name={`${day}.close`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormLabel className="text-sm font-normal whitespace-nowrap">
                              {t('closeTime')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={updateMutation.isPending}
                                className="w-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
