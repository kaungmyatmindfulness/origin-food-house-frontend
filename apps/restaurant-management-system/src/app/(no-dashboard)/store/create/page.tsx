'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { toast } from '@repo/ui/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ROUTES } from '@/common/constants/routes';
import { storeKeys } from '@/features/store/queries/store.keys';
import { createStore } from '@/features/store/services/store.service';

import type { CreateStoreDto } from '@/features/store/types/store.types';

export default function CreateStorePage() {
  const t = useTranslations('store.create');
  const router = useRouter();
  const queryClient = useQueryClient();

  const createStoreSchema = z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .max(100, t('validation.nameTooLong')),
    address: z.string().optional(),
    phone: z.string().optional(),
  });

  type FormValues = z.infer<typeof createStoreSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: (data: CreateStoreDto) => createStore(data),
    onSuccess: () => {
      toast.success(t('createSuccess'));
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      router.push(ROUTES.STORE_CHOOSE);
    },
    onError: (error: Error) => {
      toast.error(t('createError'), {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createStoreMutation.mutate(data);
  };

  return (
    <main className="bg-background min-h-screen p-4">
      <section className="mx-auto mt-10 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('storeNameLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('storeNamePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('storeNameDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('addressLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('addressPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('addressDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t('phonePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('phoneDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createStoreMutation.isPending}
                >
                  {createStoreMutation.isPending
                    ? t('creating')
                    : t('createButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
