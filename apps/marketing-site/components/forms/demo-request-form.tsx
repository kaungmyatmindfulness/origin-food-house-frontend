'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/lib/toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DemoRequestForm() {
  const t = useTranslations('marketing.demo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // For MVP, just simulate submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo request would be sent to backend API here
      // Example: await submitDemoRequest({ ...data, locale });
      // Data includes: restaurantName, email, phone, message
      void data; // Used when API is connected

      toast.success(t('successTitle'), {
        description: t('successDescription'),
      });

      form.reset();
    } catch {
      toast.error(t('errorTitle'), {
        description: t('errorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="restaurantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('restaurantName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('restaurantNamePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('message')} ({t('optional')})
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('messagePlaceholder')}
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
}
