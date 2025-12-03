'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Receipt, ChefHat } from 'lucide-react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Badge } from '@repo/ui/components/badge';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  ReceiptPreview,
  KitchenTicketPreview,
  ReceiptSettingsForm,
  KitchenSettingsForm,
  PreviewCard,
  PrintSettingsPageSkeleton,
  PrintSettingsErrorCard,
} from '@/features/print/components';
import { usePrintSettings } from '@/features/print/hooks/usePrintSettings';
import { usePrintPreview } from '@/features/print/hooks/usePrintPreview';

import type {
  KitchenSettingsFormValues,
  PrintSettings,
  ReceiptSettingsFormValues,
} from '@/features/print/types';

type TabValue = 'receipt' | 'kitchen';

const TAB_CONFIG: Array<{
  value: TabValue;
  icon: typeof Receipt;
  labelKey: string;
}> = [
  { value: 'receipt', icon: Receipt, labelKey: 'tabs.receipt' },
  { value: 'kitchen', icon: ChefHat, labelKey: 'tabs.kitchen' },
];

export default function PrintSettingsPage() {
  const t = useTranslations('print.settings');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Persist tab state in URL for deep linking
  const activeTab = (searchParams.get('tab') as TabValue) || 'receipt';

  // Local state for preview updates (before saving)
  const [receiptPreviewSettings, setReceiptPreviewSettings] = useState<
    Partial<PrintSettings>
  >({});
  const [kitchenPreviewSettings, setKitchenPreviewSettings] = useState<
    Partial<PrintSettings>
  >({});

  // Refs for preview content printing
  const receiptPreviewRef = useRef<HTMLDivElement>(null);
  const kitchenPreviewRef = useRef<HTMLDivElement>(null);

  const { printPreview } = usePrintPreview();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const { settings, isLoading, error, updateSettings, isUpdating, refetch } =
    usePrintSettings(selectedStoreId);

  // Handle receipt form changes for live preview
  const handleReceiptChange = useCallback(
    (data: ReceiptSettingsFormValues) => {
      setReceiptPreviewSettings(data);
    },
    []
  );

  // Handle kitchen form changes for live preview
  const handleKitchenChange = useCallback(
    (data: KitchenSettingsFormValues) => {
      setKitchenPreviewSettings(data);
    },
    []
  );

  // Handle receipt settings submit
  const handleReceiptSubmit = useCallback(
    (data: Partial<PrintSettings>) => {
      updateSettings(data);
    },
    [updateSettings]
  );

  // Handle kitchen settings submit
  const handleKitchenSubmit = useCallback(
    (data: Partial<PrintSettings>) => {
      updateSettings(data);
    },
    [updateSettings]
  );

  // Merge current settings with preview settings for display
  const mergedReceiptSettings = { ...settings, ...receiptPreviewSettings };
  const mergedKitchenSettings = { ...settings, ...kitchenPreviewSettings };

  if (isLoading) {
    return <PrintSettingsPageSkeleton loadingLabel={t('loading')} />;
  }

  if (error || !selectedStoreId) {
    return (
      <PrintSettingsErrorCard
        error={error}
        title={t('errorTitle')}
        defaultMessage={t('errorLoading')}
        retryLabel={t('tryAgain')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <Badge variant="outline" className="text-muted-foreground">
            {t('storeSettingsBadge')}
          </Badge>
        </div>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      {/* Mobile: Select dropdown for tab navigation */}
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_CONFIG.map(({ value, icon: Icon, labelKey }) => (
              <SelectItem key={value} value={value} className="min-h-11">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{t(labelKey)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Tab navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="hidden w-full grid-cols-2 md:grid">
          {TAB_CONFIG.map(({ value, icon: Icon, labelKey }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span>{t(labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Receipt Settings Tab */}
        <TabsContent value="receipt" className="mt-6" tabIndex={-1}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form Column */}
            <div>
              <ReceiptSettingsForm
                settings={settings}
                onSubmit={handleReceiptSubmit}
                isSubmitting={isUpdating}
                onChange={handleReceiptChange}
              />
            </div>

            {/* Preview Column */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <PreviewCard
                ref={receiptPreviewRef}
                title={t('preview.title')}
                description={t('preview.receiptDescription')}
                printLabel={t('preview.printPreview')}
                onPrint={() => printPreview(receiptPreviewRef)}
              >
                <ReceiptPreview settings={mergedReceiptSettings} />
              </PreviewCard>
            </div>
          </div>
        </TabsContent>

        {/* Kitchen Settings Tab */}
        <TabsContent value="kitchen" className="mt-6" tabIndex={-1}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form Column */}
            <div>
              <KitchenSettingsForm
                settings={settings}
                onSubmit={handleKitchenSubmit}
                isSubmitting={isUpdating}
                onChange={handleKitchenChange}
              />
            </div>

            {/* Preview Column */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <PreviewCard
                ref={kitchenPreviewRef}
                title={t('preview.title')}
                description={t('preview.kitchenDescription')}
                printLabel={t('preview.printPreview')}
                onPrint={() => printPreview(kitchenPreviewRef)}
              >
                <KitchenTicketPreview settings={mergedKitchenSettings} />
              </PreviewCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
