'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface SubscriptionTabProps {
  storeId: string;
}

/**
 * Subscription management tab placeholder.
 * TODO: Implement subscription management features when backend is ready.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- storeId will be used when backend is ready
export function SubscriptionTab({ storeId: _storeId }: SubscriptionTabProps) {
  const t = useTranslations('store.settingsPage.subscription');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{t('comingSoon')}</p>
      </CardContent>
    </Card>
  );
}
