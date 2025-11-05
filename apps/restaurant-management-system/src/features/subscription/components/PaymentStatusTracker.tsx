'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { usePaymentRequest } from '../hooks/useSubscription';
import type {
  PaymentStatus,
  PaymentRequest,
} from '../types/subscription.types';

interface PaymentStatusTrackerProps {
  paymentRequestId: string;
}

export function PaymentStatusTracker({
  paymentRequestId,
}: PaymentStatusTrackerProps) {
  const t = useTranslations('subscription.paymentStatus');

  const { data: paymentRequest, isLoading } = usePaymentRequest(
    paymentRequestId,
    {
      refetchInterval: (data) => {
        const paymentData = data as PaymentRequest | undefined;
        return paymentData?.status === 'PENDING_VERIFICATION' ? 30000 : false;
      },
    }
  );

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return {
          icon: Clock,
          color: 'default' as const,
          label: t('status.pending'),
          description: t('statusDescription.pending'),
        };
      case 'VERIFIED':
        return {
          icon: CheckCircle,
          color: 'secondary' as const,
          label: t('status.verified'),
          description: t('statusDescription.verified'),
        };
      case 'ACTIVATED':
        return {
          icon: CheckCircle,
          color: 'default' as const,
          label: t('status.activated'),
          description: t('statusDescription.activated'),
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'destructive' as const,
          label: t('status.rejected'),
          description: t('statusDescription.rejected'),
        };
      default:
        return {
          icon: Clock,
          color: 'outline' as const,
          label: status,
          description: '',
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            <span className="text-muted-foreground text-sm">
              {t('loading')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentRequest) {
    return null;
  }

  const config = getStatusConfig(paymentRequest.status);
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <Icon className="text-primary h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={config.color}>{config.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {config.description}
            </p>
          </div>
        </div>

        {paymentRequest.rejectionReason && (
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-destructive text-sm font-medium">
              {t('rejectionReason')}
            </p>
            <p className="text-destructive/80 mt-1 text-sm">
              {paymentRequest.rejectionReason}
            </p>
          </div>
        )}

        <div className="space-y-2 rounded-lg border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('requestedTier')}</span>
            <span className="font-medium">
              {t(`tiers.${paymentRequest.requestedTier}`)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('amount')}</span>
            <span className="font-medium">
              {paymentRequest.currency} {paymentRequest.amount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('requestedAt')}</span>
            <span className="font-medium">
              {new Date(paymentRequest.requestedAt).toLocaleDateString()}
            </span>
          </div>
          {paymentRequest.verifiedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('verifiedAt')}</span>
              <span className="font-medium">
                {new Date(paymentRequest.verifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {paymentRequest.status === 'PENDING_VERIFICATION' && (
          <div className="bg-muted text-muted-foreground rounded-lg p-3 text-xs">
            {t('autoRefresh')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
