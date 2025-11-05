'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Crown } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { cn } from '@repo/ui/lib/utils';
import type { SubscriptionTier } from '../../types/subscription.types';

interface SelectTierStepProps {
  onSelectTier: (tier: SubscriptionTier) => void;
  isLoading?: boolean;
}

export function SelectTierStep({
  onSelectTier,
  isLoading,
}: SelectTierStepProps) {
  const t = useTranslations('subscription.upgrade');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null
  );

  const tiers = [
    {
      name: 'STANDARD' as SubscriptionTier,
      price: '$240',
      period: 'year',
      features: [
        t('features.standard.tables'),
        t('features.standard.menuItems'),
        t('features.standard.staff'),
        t('features.standard.kds'),
        t('features.standard.loyalty'),
        t('features.standard.orders'),
      ],
    },
    {
      name: 'PREMIUM' as SubscriptionTier,
      price: '$1,200',
      period: 'year',
      popular: true,
      features: [
        t('features.premium.unlimited'),
        t('features.premium.kds'),
        t('features.premium.loyalty'),
        t('features.premium.advancedBI'),
        t('features.premium.branding'),
        t('features.premium.support'),
      ],
    },
  ];

  const handleConfirm = () => {
    if (selectedTier) {
      onSelectTier(selectedTier);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              'cursor-pointer border-2 p-6 transition-all hover:shadow-md',
              selectedTier === tier.name && 'border-primary',
              tier.popular && 'relative'
            )}
            onClick={() => setSelectedTier(tier.name)}
          >
            {tier.popular && (
              <Badge className="absolute -top-3 left-4" variant="default">
                <Crown className="mr-1 h-3 w-3" />
                {t('popular')}
              </Badge>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {t(`tiers.${tier.name}`)}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">
                  / {t(`period.${tier.period}`)}
                </span>
              </div>
            </div>

            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {selectedTier === tier.name && (
              <div className="mt-4 flex justify-center">
                <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                  <Check className="text-primary-foreground h-4 w-4" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!selectedTier || isLoading}>
          {isLoading ? t('loading') : t('continue')}
        </Button>
      </div>
    </div>
  );
}
