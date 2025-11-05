'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, RefreshCcw, Users, History } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { TierBadge } from './TierBadge';
import { UpgradeModal } from './UpgradeModal';
import { RefundRequestForm } from './RefundRequestForm';
import { OwnershipTransferModal } from './OwnershipTransferModal';
import { PaymentStatusTracker } from './PaymentStatusTracker';
import { useSubscription, usePaymentRequests } from '../hooks/useSubscription';

interface SubscriptionTabProps {
  storeId: string;
}

export function SubscriptionTab({ storeId }: SubscriptionTabProps) {
  const t = useTranslations('subscription');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const { data: subscription, isLoading } = useSubscription(storeId);
  const { data: paymentRequestsData } = usePaymentRequests(storeId);

  const canUpgrade =
    subscription &&
    (subscription.tier === 'FREE' || subscription.status === 'TRIAL');

  const canRequestRefund =
    subscription &&
    subscription.status === 'ACTIVE' &&
    subscription.currentPeriodStart &&
    (() => {
      const activationDate = new Date(subscription.currentPeriodStart);
      const daysSinceActivation = Math.floor(
        (Date.now() - activationDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceActivation <= 30;
    })();

  const pendingPayment = paymentRequestsData?.data.find(
    (pr) => pr.status === 'PENDING_VERIFICATION'
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('noSubscription')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('currentSubscription')}</CardTitle>
              <CardDescription>{t('manageSubscription')}</CardDescription>
            </div>
            <TierBadge
              tier={subscription.tier}
              status={subscription.status}
              trialEndsAt={subscription.trialEndsAt}
              expiryDate={subscription.currentPeriodEnd}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription.status === 'TRIAL' && subscription.trialEndsAt && (
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                {t('trialMessage')}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {t('trialEndsOn', {
                  date: new Date(subscription.trialEndsAt).toLocaleDateString(),
                })}
              </p>
            </div>
          )}

          {subscription.status === 'ACTIVE' &&
            subscription.currentPeriodEnd && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {t('subscriptionActive')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t('renewsOn', {
                        date: new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString(),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex flex-wrap gap-3">
            {canUpgrade && (
              <Button onClick={() => setShowUpgradeModal(true)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('upgradePlan')}
              </Button>
            )}
            {canRequestRefund && (
              <Button
                variant="outline"
                onClick={() => setShowRefundModal(true)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t('requestRefund')}
              </Button>
            )}
            {subscription.tier !== 'FREE' && (
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                {t('transferOwnership')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {pendingPayment && (
        <PaymentStatusTracker paymentRequestId={pendingPayment.id} />
      )}

      {paymentRequestsData && paymentRequestsData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('paymentHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentRequestsData.data.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {t(`tiers.${payment.requestedTier}`)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(payment.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {payment.amount} {payment.currency}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        `paymentStatus.status.${payment.status.toLowerCase()}`
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        storeId={storeId}
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      <RefundRequestForm
        storeId={storeId}
        subscription={subscription}
        open={showRefundModal}
        onClose={() => setShowRefundModal(false)}
      />
      <OwnershipTransferModal
        storeId={storeId}
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />
    </div>
  );
}
