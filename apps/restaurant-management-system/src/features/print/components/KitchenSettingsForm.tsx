'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@repo/ui/components/switch';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

import { kitchenSettingsSchema } from '../schemas';

import type { FontSize, PaperSize, PrintSettings } from '../types';
import type { KitchenSettingsFormValues } from '../schemas';

interface KitchenSettingsFormProps {
  settings: PrintSettings;
  onSubmit: (data: Partial<PrintSettings>) => void;
  isSubmitting: boolean;
  onChange?: (data: KitchenSettingsFormValues) => void;
}

/**
 * Form for configuring kitchen ticket print settings.
 */
export function KitchenSettingsForm({
  settings,
  onSubmit,
  isSubmitting,
  onChange,
}: KitchenSettingsFormProps) {
  const t = useTranslations('print.settings');
  const tPaperSizes = useTranslations('print.settings.paperSizes');
  const tFontSizes = useTranslations('print.settings.fontSizes');

  const form = useForm<KitchenSettingsFormValues>({
    resolver: zodResolver(kitchenSettingsSchema),
    defaultValues: {
      autoPrintKitchenTicket: settings.autoPrintKitchenTicket,
      kitchenTicketCopies: settings.kitchenTicketCopies,
      kitchenPaperSize: settings.kitchenPaperSize,
      kitchenFontSize: settings.kitchenFontSize,
      showOrderNumber: settings.showOrderNumber,
      showTableNumber: settings.showTableNumber,
      showTimestamp: settings.showTimestamp,
      defaultKitchenPrinter: settings.defaultKitchenPrinter,
    },
  });

  // Reset form when settings change
  useEffect(() => {
    form.reset({
      autoPrintKitchenTicket: settings.autoPrintKitchenTicket,
      kitchenTicketCopies: settings.kitchenTicketCopies,
      kitchenPaperSize: settings.kitchenPaperSize,
      kitchenFontSize: settings.kitchenFontSize,
      showOrderNumber: settings.showOrderNumber,
      showTableNumber: settings.showTableNumber,
      showTimestamp: settings.showTimestamp,
      defaultKitchenPrinter: settings.defaultKitchenPrinter,
    });
  }, [settings, form]);

  // Watch form changes for preview updates
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onChange) {
        onChange(value as KitchenSettingsFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleSubmit = (data: KitchenSettingsFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('kitchenTicket')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-Print Kitchen Ticket Toggle */}
            <FormField
              control={form.control}
              name="autoPrintKitchenTicket"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('autoPrintMode')}
                    </FormLabel>
                    <FormDescription>
                      {t('autoPrintKitchenDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Paper Size */}
            <FormField
              control={form.control}
              name="kitchenPaperSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paperSize')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['58mm', '80mm'] as PaperSize[]).map((size) => (
                        <SelectItem
                          key={size}
                          value={size}
                          className="min-h-11"
                        >
                          {tPaperSizes(size)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('paperSizeDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Font Size */}
            <FormField
              control={form.control}
              name="kitchenFontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fontSize')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        ['small', 'medium', 'large', 'xlarge'] as FontSize[]
                      ).map((size) => (
                        <SelectItem
                          key={size}
                          value={size}
                          className="min-h-11"
                        >
                          {tFontSizes(size)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('fontSizeDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kitchen Ticket Copies */}
            <FormField
              control={form.control}
              name="kitchenTicketCopies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('copies')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      className="h-11 w-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('copiesDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t('displayOptions')}</h4>

              {/* Show Order Number */}
              <FormField
                control={form.control}
                name="showOrderNumber"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('showOrderNumber')}
                      </FormLabel>
                      <FormDescription>
                        {t('showOrderNumberDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Show Table Number */}
              <FormField
                control={form.control}
                name="showTableNumber"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('showTableNumber')}
                      </FormLabel>
                      <FormDescription>
                        {t('showTableNumberDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Show Timestamp */}
              <FormField
                control={form.control}
                name="showTimestamp"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('showTimestamp')}
                      </FormLabel>
                      <FormDescription>
                        {t('showTimestampDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('save')
          )}
        </Button>
      </form>
    </Form>
  );
}
