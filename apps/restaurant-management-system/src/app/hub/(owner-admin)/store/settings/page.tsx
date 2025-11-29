'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Receipt,
  Clock,
  Palette,
  Gift,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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
import { Skeleton } from '@repo/ui/components/skeleton';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getStoreDetails } from '@/features/store/services/store.service';
import { TaxAndServiceTab } from '@/features/store/components/settings/tax-and-service-tab';
import { BusinessHoursTab } from '@/features/store/components/settings/business-hours-tab';
import { BrandingTab } from '@/features/store/components/settings/branding-tab';
import { LoyaltyProgramTab } from '@/features/store/components/settings/loyalty-program-tab';
import { SubscriptionTab } from '@/features/subscription/components/SubscriptionTab';
import type { GetStoreDetailsResponseDto } from '@/features/store/types/store.types';

const storeDetailsQueryKey = (storeId: string | null) => [
  'storeDetails',
  storeId,
];

type TabValue = 'tax' | 'hours' | 'branding' | 'loyalty' | 'subscription';

const TAB_CONFIG: Array<{
  value: TabValue;
  icon: typeof Receipt;
  labelKey: string;
}> = [
  { value: 'tax', icon: Receipt, labelKey: 'tabs.taxAndService' },
  { value: 'hours', icon: Clock, labelKey: 'tabs.businessHours' },
  { value: 'branding', icon: Palette, labelKey: 'tabs.branding' },
  { value: 'loyalty', icon: Gift, labelKey: 'tabs.loyalty' },
  { value: 'subscription', icon: CreditCard, labelKey: 'tabs.subscription' },
];

export default function StoreSettingsPage() {
  const t = useTranslations('store.settingsPage');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Persist tab state in URL for deep linking
  const activeTab = (searchParams.get('tab') as TabValue) || 'tax';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const {
    data: storeDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GetStoreDetailsResponseDto | null, Error>({
    queryKey: storeDetailsQueryKey(selectedStoreId),
    queryFn: async () => {
      if (!selectedStoreId) return null;
      return getStoreDetails(selectedStoreId);
    },
    enabled: !!selectedStoreId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-5xl space-y-6 p-6"
        role="status"
        aria-label={t('loading')}
      >
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          {/* Desktop tabs skeleton */}
          <div className="hidden gap-1 md:grid md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
          {/* Mobile select skeleton */}
          <Skeleton className="h-10 w-full rounded-md md:hidden" />

          {/* Content skeleton */}
          <div className="border-border rounded-lg border p-6">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="mb-6 h-4 w-64" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </div>
        </div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (isError || !storeDetails || !selectedStoreId) {
    return (
      <div className="mx-auto max-w-5xl p-6" role="alert" aria-live="polite">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              <CardTitle className="text-lg">{t('errorTitle')}</CardTitle>
            </div>
            <CardDescription>
              {error instanceof Error ? error.message : t('errorLoading')}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('tryAgain')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const settings = storeDetails.setting;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Enhanced header with store context */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <Badge variant="outline" className="text-muted-foreground">
            {storeDetails.information?.name ?? 'Store'}
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
              <SelectItem key={value} value={value}>
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
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="hidden w-full grid-cols-5 md:grid">
          {TAB_CONFIG.map(({ value, icon: Icon, labelKey }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{t(labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tax" className="mt-6" tabIndex={-1}>
          <TaxAndServiceTab
            storeId={selectedStoreId}
            vatRate={settings?.vatRate}
            serviceChargeRate={settings?.serviceChargeRate}
          />
        </TabsContent>

        <TabsContent value="hours" className="mt-6" tabIndex={-1}>
          <BusinessHoursTab
            storeId={selectedStoreId}
            initialHours={
              settings?.businessHours as Parameters<
                typeof BusinessHoursTab
              >[0]['initialHours']
            }
          />
        </TabsContent>

        <TabsContent value="branding" className="mt-6" tabIndex={-1}>
          <BrandingTab
            storeId={selectedStoreId}
            currentLogoUrl={storeDetails.logoUrl}
            currentCoverUrl={storeDetails.coverImageUrl}
          />
        </TabsContent>

        <TabsContent value="loyalty" className="mt-6" tabIndex={-1}>
          <LoyaltyProgramTab
            storeId={selectedStoreId}
            storeTier={storeDetails.tier ?? 'FREE'}
            enabled={settings?.loyaltyEnabled}
            pointRate={settings?.loyaltyPointRate}
            redemptionRate={settings?.loyaltyRedemptionRate}
            expiryDays={settings?.loyaltyPointExpiryDays}
          />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6" tabIndex={-1}>
          <SubscriptionTab storeId={selectedStoreId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
