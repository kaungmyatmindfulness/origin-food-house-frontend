'use client';

import { useTranslations } from 'next-intl';
import { Clock, Crown } from 'lucide-react';
import { Badge } from '@repo/ui/components/badge';
import type {
  SubscriptionTier,
  SubscriptionStatus,
} from '../types/subscription.types';

interface TierBadgeProps {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndsAt?: string;
  expiryDate?: string;
}

export function TierBadge({
  tier,
  status,
  trialEndsAt,
  expiryDate,
}: TierBadgeProps) {
  const t = useTranslations('subscription.tierBadge');

  const isTrial = status === 'TRIAL';
  const isExpired = status === 'EXPIRED';

  const daysRemaining = trialEndsAt
    ? Math.ceil(
        (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const getBadgeVariant = () => {
    if (isExpired) return 'destructive';
    if (isTrial) return 'default';
    if (tier === 'PREMIUM') return 'default';
    if (tier === 'STANDARD') return 'secondary';
    return 'outline';
  };

  const getIcon = () => {
    if (isTrial) return <Clock className="h-3 w-3" />;
    if (tier === 'PREMIUM')
      return <Crown className="h-3 w-3 text-yellow-500" />;
    return null;
  };

  const getLabel = () => {
    if (isExpired) return t('expired');
    if (isTrial && daysRemaining !== null) {
      return t('trial', { tier: t(`tiers.${tier}`), days: daysRemaining });
    }
    return t(`tiers.${tier}`);
  };

  const getSubtext = () => {
    if (isTrial && daysRemaining !== null) {
      return t('trialEndsIn', { days: daysRemaining });
    }
    if (expiryDate && tier !== 'FREE') {
      const expiryDateFormatted = new Date(expiryDate).toLocaleDateString();
      return t('renewsOn', { date: expiryDateFormatted });
    }
    return null;
  };

  const icon = getIcon();
  const subtext = getSubtext();

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant={getBadgeVariant()} className="flex items-center gap-1.5">
        {icon}
        <span>{getLabel()}</span>
      </Badge>
      {subtext && <p className="text-muted-foreground text-xs">{subtext}</p>}
    </div>
  );
}
