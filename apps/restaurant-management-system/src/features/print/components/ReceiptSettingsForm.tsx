'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, X, Loader2 } from 'lucide-react';

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

import { receiptSettingsSchema } from '../schemas';

import type { AutoPrintMode, PaperSize, PrintSettings } from '../types';
import type { ReceiptSettingsFormValues } from '../schemas';

interface ReceiptSettingsFormProps {
  settings: PrintSettings;
  onSubmit: (data: Partial<PrintSettings>) => void;
  isSubmitting: boolean;
  onChange?: (data: ReceiptSettingsFormValues) => void;
}

/**
 * Form for configuring receipt print settings.
 */
export function ReceiptSettingsForm({
  settings,
  onSubmit,
  isSubmitting,
  onChange,
}: ReceiptSettingsFormProps) {
  const t = useTranslations('print.settings');
  const tMode = useTranslations('print.settings.mode');
  const tPaperSizes = useTranslations('print.settings.paperSizes');

  const form = useForm<ReceiptSettingsFormValues>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {
      autoPrintReceipt: settings.autoPrintReceipt,
      receiptCopies: settings.receiptCopies,
      showLogo: settings.showLogo,
      headerText: settings.headerText,
      footerText: settings.footerText,
      paperSize: settings.paperSize,
      defaultReceiptPrinter: settings.defaultReceiptPrinter,
    },
  });

  // Field arrays for header and footer text
  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: 'headerText' as never,
  });

  const {
    fields: footerFields,
    append: appendFooter,
    remove: removeFooter,
  } = useFieldArray({
    control: form.control,
    name: 'footerText' as never,
  });

  // Reset form when settings change
  useEffect(() => {
    form.reset({
      autoPrintReceipt: settings.autoPrintReceipt,
      receiptCopies: settings.receiptCopies,
      showLogo: settings.showLogo,
      headerText: settings.headerText,
      footerText: settings.footerText,
      paperSize: settings.paperSize,
      defaultReceiptPrinter: settings.defaultReceiptPrinter,
    });
  }, [settings, form]);

  // Watch form changes for preview updates
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onChange) {
        onChange(value as ReceiptSettingsFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleSubmit = (data: ReceiptSettingsFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('customerReceipt')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-Print Mode */}
            <FormField
              control={form.control}
              name="autoPrintReceipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('autoPrintMode')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['manual', 'auto', 'never'] as AutoPrintMode[]).map(
                        (mode) => (
                          <SelectItem
                            key={mode}
                            value={mode}
                            className="min-h-11"
                          >
                            <div>
                              <div className="font-medium">{tMode(mode)}</div>
                              <div className="text-muted-foreground text-xs">
                                {tMode(`${mode}Description`)}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paper Size */}
            <FormField
              control={form.control}
              name="paperSize"
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

            {/* Receipt Copies */}
            <FormField
              control={form.control}
              name="receiptCopies"
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

            {/* Show Logo Toggle */}
            <FormField
              control={form.control}
              name="showLogo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('showLogo')}</FormLabel>
                    <FormDescription>
                      {t('showLogoDescription')}
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

            {/* Header Text Array */}
            <div className="space-y-3">
              <FormLabel>{t('headerText')}</FormLabel>
              <FormDescription>{t('headerTextDescription')}</FormDescription>
              {headerFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`headerText.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Line ${index + 1}`}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => removeHeader(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {headerFields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendHeader('')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addLine')}
                </Button>
              )}
            </div>

            {/* Footer Text Array */}
            <div className="space-y-3">
              <FormLabel>{t('footerText')}</FormLabel>
              <FormDescription>{t('footerTextDescription')}</FormDescription>
              {footerFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`footerText.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Line ${index + 1}`}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => removeFooter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {footerFields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFooter('')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addLine')}
                </Button>
              )}
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
