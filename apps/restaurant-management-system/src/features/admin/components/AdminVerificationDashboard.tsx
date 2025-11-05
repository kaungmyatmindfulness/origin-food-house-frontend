'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdminMetrics } from '../hooks/useAdminPayments';
import { PaymentRequestQueue } from './PaymentRequestQueue';
import { PaymentProofViewer } from './PaymentProofViewer';

export function AdminVerificationDashboard() {
  const t = useTranslations('admin.dashboard');
  const [activeTab, setActiveTab] = useState<
    'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'ALL'
  >('PENDING_VERIFICATION');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );

  const { data: metrics, isLoading: metricsLoading } = useAdminMetrics();

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} ${t('minutes')}`;
    }
    return `${hours.toFixed(1)} ${t('hours')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : metrics ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pendingVerification')}
                </CardTitle>
                <AlertCircle className="size-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pendingCount}</div>
                <p className="text-muted-foreground text-xs">
                  {t('requiresAction')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('verifiedToday')}
                </CardTitle>
                <CheckCircle className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.verifiedToday}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('todayCount')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('rejectedToday')}
                </CardTitle>
                <XCircle className="size-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.rejectedToday}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('todayCount')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('avgVerificationTime')}
                </CardTitle>
                <Clock className="size-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.avgVerificationTimeHours)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('slaTarget', { target: '24h' })}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentQueue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(
                v as 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'ALL'
              )
            }
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="PENDING_VERIFICATION" className="relative">
                {t('pending')}
                {metrics && metrics.pendingCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 flex size-5 items-center justify-center rounded-full p-0"
                  >
                    {metrics.pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="VERIFIED">{t('verified')}</TabsTrigger>
              <TabsTrigger value="REJECTED">{t('rejected')}</TabsTrigger>
              <TabsTrigger value="ALL">{t('all')}</TabsTrigger>
            </TabsList>

            <TabsContent value="PENDING_VERIFICATION" className="mt-6">
              <PaymentRequestQueue
                status="PENDING_VERIFICATION"
                onViewPayment={setSelectedPaymentId}
              />
            </TabsContent>

            <TabsContent value="VERIFIED" className="mt-6">
              <PaymentRequestQueue
                status="VERIFIED"
                onViewPayment={setSelectedPaymentId}
              />
            </TabsContent>

            <TabsContent value="REJECTED" className="mt-6">
              <PaymentRequestQueue
                status="REJECTED"
                onViewPayment={setSelectedPaymentId}
              />
            </TabsContent>

            <TabsContent value="ALL" className="mt-6">
              <PaymentRequestQueue
                status={'PENDING_VERIFICATION'}
                onViewPayment={setSelectedPaymentId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PaymentProofViewer
        paymentRequestId={selectedPaymentId}
        open={!!selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
      />
    </div>
  );
}
