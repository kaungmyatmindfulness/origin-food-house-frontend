'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Crown, TrendingUp } from 'lucide-react';

import { getTierUsage } from '../services/tier.service';
import { tierKeys } from '../queries/tier.keys';
import type { TierName } from '../types/tier.types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
// import { Progress } from '@repo/ui/components/progress';
import { Skeleton } from '@repo/ui/components/skeleton';

interface UsageProgressBarProps {
  label: string;
  current: number;
  limit: number;
}

function UsageProgressBar({ label, current, limit }: UsageProgressBarProps) {
  const t = useTranslations('tierUsage');
  const percentage = limit > 0 ? (current / limit) * 100 : 0;

  // Color coding based on usage percentage
  const getColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {current} / {limit}
        </span>
      </div>
      <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-full">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-muted-foreground text-right text-xs">
        {percentage.toFixed(0)}% {t('used')}
      </div>
    </div>
  );
}

interface TierUsageWidgetProps {
  storeId: string;
  onUpgrade?: () => void;
}

export function TierUsageWidget({ storeId, onUpgrade }: TierUsageWidgetProps) {
  const t = useTranslations('tierUsage');

  const {
    data: usage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: tierKeys.usage(storeId),
    queryFn: () => getTierUsage(storeId),
    enabled: !!storeId,
  });

  const getTierBadgeVariant = (tier: TierName) => {
    switch (tier) {
      case 'PREMIUM':
        return 'default';
      case 'STANDARD':
        return 'secondary';
      case 'FREE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{t('errorLoading')}</p>
        </CardContent>
      </Card>
    );
  }

  const isPremium = usage.tier === 'PREMIUM';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t('title')}
            {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
          </CardTitle>
          <Badge variant={getTierBadgeVariant(usage.tier)}>
            {t(`tiers.${usage.tier}`)}
          </Badge>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bars */}
        <div className="space-y-4">
          <UsageProgressBar
            label={t('resources.tables')}
            current={usage.current.tables}
            limit={usage.limits.tables}
          />
          <UsageProgressBar
            label={t('resources.menuItems')}
            current={usage.current.menuItems}
            limit={usage.limits.menuItems}
          />
          <UsageProgressBar
            label={t('resources.staff')}
            current={usage.current.staff}
            limit={usage.limits.staff}
          />
          <UsageProgressBar
            label={t('resources.monthlyOrders')}
            current={usage.current.monthlyOrders}
            limit={usage.limits.monthlyOrders}
          />
        </div>

        {/* Upgrade Button */}
        {!isPremium && (
          <Button
            onClick={onUpgrade}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('upgrade')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
