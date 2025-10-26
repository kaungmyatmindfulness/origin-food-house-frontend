'use client';

import { useTranslations } from 'next-intl';
import { Check, Crown, Zap, Building2 } from 'lucide-react';

import type { TierName } from '../types/tier.types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface TierUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: TierName;
  featureName?: string;
  featureDescription?: string;
}

export function TierUpgradeDialog({
  open,
  onOpenChange,
  currentTier,
  featureName,
  featureDescription,
}: TierUpgradeDialogProps) {
  const t = useTranslations('tierUsage.upgradeDialog');

  const tiers = [
    {
      name: 'FREE' as TierName,
      icon: Building2,
      price: 0,
      limits: {
        tables: 5,
        menuItems: 20,
        staff: 3,
        monthlyOrders: 100,
      },
      features: [
        t('features.free.basic'),
        t('features.free.qrOrdering'),
        t('features.free.basicReports'),
        t('features.free.emailSupport'),
      ],
    },
    {
      name: 'STANDARD' as TierName,
      icon: Zap,
      price: 20,
      limits: {
        tables: 20,
        menuItems: 100,
        staff: 10,
        monthlyOrders: 1000,
      },
      features: [
        t('features.standard.everything'),
        t('features.standard.kds'),
        t('features.standard.advancedReports'),
        t('features.standard.staffManagement'),
        t('features.standard.prioritySupport'),
      ],
      recommended: true,
    },
    {
      name: 'PREMIUM' as TierName,
      icon: Crown,
      price: 100,
      limits: {
        tables: -1, // Unlimited
        menuItems: -1,
        staff: -1,
        monthlyOrders: -1,
      },
      features: [
        t('features.premium.everything'),
        t('features.premium.unlimited'),
        t('features.premium.multiLocation'),
        t('features.premium.apiAccess'),
        t('features.premium.customization'),
        t('features.premium.dedicatedSupport'),
      ],
    },
  ];

  const formatLimit = (value: number) => {
    if (value === -1) return t('unlimited');
    return value.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
          <DialogDescription>
            {featureName
              ? t('featureLockedDescription', { feature: featureName })
              : t('description')}
          </DialogDescription>
        </DialogHeader>

        {featureDescription && (
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">{featureDescription}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = tier.name === currentTier;
            const isDowngrade =
              (currentTier === 'PREMIUM' && tier.name !== 'PREMIUM') ||
              (currentTier === 'STANDARD' && tier.name === 'FREE');

            return (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.recommended ? 'border-primary shadow-lg' : ''
                } ${isCurrent ? 'bg-muted/50' : ''}`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3 py-1">
                      {t('recommended')}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="text-primary h-6 w-6" />
                    {isCurrent && (
                      <Badge variant="outline">{t('currentPlan')}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {t(`tiers.${tier.name}`)}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-foreground text-3xl font-bold">
                      ${tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Limits */}
                  <div className="space-y-2 border-b pb-4">
                    <p className="text-sm font-semibold">{t('limits')}</p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>
                        {formatLimit(tier.limits.tables)} {t('tables')}
                      </li>
                      <li>
                        {formatLimit(tier.limits.menuItems)} {t('menuItems')}
                      </li>
                      <li>
                        {formatLimit(tier.limits.staff)} {t('staff')}
                      </li>
                      <li>
                        {formatLimit(tier.limits.monthlyOrders)}{' '}
                        {t('ordersPerMonth')}
                      </li>
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">
                      {t('features.title')}
                    </p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    variant={tier.recommended ? 'default' : 'outline'}
                    disabled={isCurrent || isDowngrade}
                    onClick={() => {
                      // TODO: Implement Stripe checkout in Slice E
                      onOpenChange(false);
                    }}
                  >
                    {isCurrent
                      ? t('currentPlan')
                      : isDowngrade
                        ? t('notAvailable')
                        : t('upgrade')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted text-muted-foreground rounded-lg p-4 text-center text-sm">
          {t('note')}
        </div>
      </DialogContent>
    </Dialog>
  );
}
