'use client';

import { useProtected } from '@/features/auth/hooks/useProtected';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { TierGate } from '@/features/tiers/components/tier-gate';
import { useTranslations } from 'next-intl';

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('tierUsage.kds');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const { isFinished, isLoading } = useProtected({
    allowedRoles: ['CHEF', 'OWNER', 'ADMIN'],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isFinished) {
    return null;
  }

  // Wrap with TierGate to enforce KDS access control
  return (
    <TierGate
      storeId={selectedStoreId || ''}
      featureName={t('featureName')}
      featureDescription={t('featureDescription')}
      requiredTiers={['STANDARD', 'PREMIUM']}
    >
      <div>{children}</div>
    </TierGate>
  );
}
