'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getStoreDetails } from '@/features/store/services/store.service';
import { TaxAndServiceTab } from '@/features/store/components/settings/tax-and-service-tab';
import { BusinessHoursTab } from '@/features/store/components/settings/business-hours-tab';
import { BrandingTab } from '@/features/store/components/settings/branding-tab';
import { LoyaltyProgramTab } from '@/features/store/components/settings/loyalty-program-tab';
import type { GetStoreDetailsResponseDto } from '@/features/store/types/store.types';

const storeDetailsQueryKey = (storeId: string | null) => [
  'storeDetails',
  storeId,
];

export default function StoreSettingsPage() {
  const t = useTranslations('store.settingsPage');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const {
    data: storeDetails,
    isLoading,
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

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="mb-2 h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !storeDetails || !selectedStoreId) {
    return (
      <div className="text-destructive p-6 text-center">
        <p>{t('errorLoading')}</p>
        {error instanceof Error && <p className="text-sm">{error.message}</p>}
      </div>
    );
  }

  const settings = storeDetails.setting;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      <Tabs defaultValue="tax" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tax">{t('tabs.taxAndService')}</TabsTrigger>
          <TabsTrigger value="hours">{t('tabs.businessHours')}</TabsTrigger>
          <TabsTrigger value="branding">{t('tabs.branding')}</TabsTrigger>
          <TabsTrigger value="loyalty">{t('tabs.loyalty')}</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="mt-6">
          <TaxAndServiceTab
            storeId={selectedStoreId}
            vatRate={settings?.vatRate}
            serviceChargeRate={settings?.serviceChargeRate}
          />
        </TabsContent>

        <TabsContent value="hours" className="mt-6">
          <BusinessHoursTab
            storeId={selectedStoreId}
            initialHours={settings?.businessHours}
          />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingTab
            storeId={selectedStoreId}
            currentLogoUrl={storeDetails.logoUrl}
            currentCoverUrl={storeDetails.coverImageUrl}
          />
        </TabsContent>

        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyProgramTab
            storeId={selectedStoreId}
            storeTier={storeDetails.tier ?? 'FREE'}
            enabled={settings?.loyaltyEnabled}
            pointRate={settings?.loyaltyPointRate}
            redemptionRate={settings?.loyaltyRedemptionRate}
            expiryDays={settings?.loyaltyExpiryDays}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
