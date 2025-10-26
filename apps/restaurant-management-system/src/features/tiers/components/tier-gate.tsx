'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';

import { getTierUsage } from '../services/tier.service';
import { tierKeys } from '../queries/tier.keys';
import { TierUpgradeDialog } from './tier-upgrade-dialog';

import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface TierGateProps {
  storeId: string;
  featureName: string;
  featureDescription: string;
  requiredTiers: ('STANDARD' | 'PREMIUM')[];
  children: React.ReactNode;
}

export function TierGate({
  storeId,
  featureName,
  featureDescription,
  requiredTiers,
  children,
}: TierGateProps) {
  const t = useTranslations('tierUsage.tierGate');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const { data: usage, isLoading } = useQuery({
    queryKey: tierKeys.usage(storeId),
    queryFn: () => getTierUsage(storeId),
    enabled: !!storeId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-48 w-96" />
      </div>
    );
  }

  const hasAccess =
    usage && requiredTiers.includes(usage.tier as 'STANDARD' | 'PREMIUM');

  if (!hasAccess) {
    return (
      <>
        <div className="flex h-screen items-center justify-center p-6">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Lock className="text-muted-foreground h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">{featureName}</CardTitle>
              <CardDescription>{featureDescription}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                {t('description', {
                  tiers: requiredTiers
                    .map((tier) => t(`tiers.${tier}`))
                    .join(` ${t('or')} `),
                })}
              </p>
              <button
                onClick={() => setShowUpgradeDialog(true)}
                className="text-primary hover:underline"
              >
                {t('viewPlans')}
              </button>
            </CardContent>
          </Card>
        </div>

        <TierUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentTier={usage?.tier || 'FREE'}
          featureName={featureName}
          featureDescription={featureDescription}
        />
      </>
    );
  }

  return <>{children}</>;
}
