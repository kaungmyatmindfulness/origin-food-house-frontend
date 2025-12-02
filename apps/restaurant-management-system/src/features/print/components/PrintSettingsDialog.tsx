'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Settings, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Separator } from '@repo/ui/components/separator';
import { Skeleton } from '@repo/ui/components/skeleton';

import { usePrintSettings } from '../hooks/usePrintSettings';
import type { AutoPrintMode } from '../types/print.types';

/**
 * Zod schema for print settings form validation
 */
const printSettingsSchema = z.object({
  autoPrintReceipt: z.enum(['manual', 'auto', 'never']),
  autoPrintKitchenTicket: z.boolean(),
  receiptCopies: z.coerce.number().min(1).max(5),
  kitchenTicketCopies: z.coerce.number().min(1).max(5),
  showLogo: z.boolean(),
});

type PrintSettingsFormValues = z.infer<typeof printSettingsSchema>;

interface PrintSettingsDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Store ID to load/save settings for */
  storeId: string;
}

/**
 * Dialog for configuring print settings.
 *
 * Settings are synced with the backend per-store.
 *
 * Features:
 * - Auto-print mode selection for customer receipts
 * - Kitchen ticket auto-print toggle
 * - Number of copies for each document type
 * - Logo display toggle
 *
 * @example
 * ```tsx
 * function StoreSettings({ storeId }: { storeId: string }) {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Print Settings</Button>
 *       <PrintSettingsDialog
 *         open={open}
 *         onOpenChange={setOpen}
 *         storeId={storeId}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function PrintSettingsDialog({
  open,
  onOpenChange,
  storeId,
}: PrintSettingsDialogProps) {
  const t = useTranslations('print.settings');
  const tMode = useTranslations('print.settings.mode');

  const { settings, isLoading, updateSettings, isUpdating } =
    usePrintSettings(storeId);

  const form = useForm<PrintSettingsFormValues>({
    resolver: zodResolver(printSettingsSchema),
    defaultValues: {
      autoPrintReceipt: 'manual' as AutoPrintMode,
      autoPrintKitchenTicket: true,
      receiptCopies: 1,
      kitchenTicketCopies: 1,
      showLogo: true,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings && open) {
      form.reset({
        autoPrintReceipt: settings.autoPrintReceipt,
        autoPrintKitchenTicket: settings.autoPrintKitchenTicket,
        receiptCopies: settings.receiptCopies,
        kitchenTicketCopies: settings.kitchenTicketCopies,
        showLogo: settings.showLogo,
      });
    }
  }, [settings, form, open]);

  const onSubmit = (data: PrintSettingsFormValues) => {
    updateSettings(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 py-4">
                {/* Customer Receipt Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    {t('customerReceipt')}
                  </h4>

                  {/* Auto-Print Mode */}
                  <FormField
                    control={form.control}
                    name="autoPrintReceipt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('autoPrintMode')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual" className="min-h-11">
                              <div>
                                <div className="font-medium">
                                  {tMode('manual')}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {tMode('manualDescription')}
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="auto" className="min-h-11">
                              <div>
                                <div className="font-medium">
                                  {tMode('auto')}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {tMode('autoDescription')}
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="never" className="min-h-11">
                              <div>
                                <div className="font-medium">
                                  {tMode('never')}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {tMode('neverDescription')}
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                            max={5}
                            className="h-11 w-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>1-5 copies</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Kitchen Ticket Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t('kitchenTicket')}</h4>

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
                            {tMode('autoDescription')}
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
                            max={5}
                            className="h-11 w-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>1-5 copies</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Display Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Display</h4>

                  {/* Show Logo Toggle */}
                  <FormField
                    control={form.control}
                    name="showLogo"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('showLogo')}
                          </FormLabel>
                          <FormDescription>
                            Display store logo on receipts
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
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => onOpenChange(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-11" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
