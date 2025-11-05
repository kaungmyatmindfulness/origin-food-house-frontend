'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { Label } from '@repo/ui/components/label';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Badge } from '@repo/ui/components/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';
import {
  usePaymentRequestDetail,
  useVerifyPayment,
  useRejectPayment,
} from '../hooks/useAdminPayments';

interface PaymentProofViewerProps {
  paymentRequestId: string | null;
  open: boolean;
  onClose: () => void;
}

export function PaymentProofViewer({
  paymentRequestId,
  open,
  onClose,
}: PaymentProofViewerProps) {
  const t = useTranslations('admin.paymentProof');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: payment, isLoading } =
    usePaymentRequestDetail(paymentRequestId);
  const verifyPayment = useVerifyPayment();
  const rejectPayment = useRejectPayment();

  const handleApprove = async () => {
    if (!paymentRequestId) return;

    if (!window.confirm(t('confirmApprove'))) return;

    try {
      await verifyPayment.mutateAsync({ paymentRequestId });
      toast.success(t('approveSuccess'));
      onClose();
    } catch {
      toast.error(t('approveFailed'));
    }
  };

  const handleReject = async () => {
    if (!paymentRequestId) return;

    if (!rejectionReason.trim()) {
      toast.error(t('reasonRequired'));
      return;
    }

    try {
      await rejectPayment.mutateAsync({
        paymentRequestId,
        reason: rejectionReason,
      });
      toast.success(t('rejectSuccess'));
      setShowRejectModal(false);
      setRejectionReason('');
      onClose();
    } catch {
      toast.error(t('rejectFailed'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <Badge variant="secondary">{t('statusPending')}</Badge>;
      case 'VERIFIED':
        return (
          <Badge variant="default" className="bg-green-600">
            {t('statusVerified')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="bg-red-600">
            {t('statusRejected')}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : payment ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-4 font-semibold">{t('paymentProof')}</h3>
                  {payment.paymentProofPresignedUrl ? (
                    payment.paymentProofUrl?.endsWith('.pdf') ? (
                      <iframe
                        src={payment.paymentProofPresignedUrl}
                        className="h-[500px] w-full rounded-lg border"
                        title="Payment Proof PDF"
                      />
                    ) : (
                      <img
                        src={payment.paymentProofPresignedUrl}
                        alt="Payment Proof"
                        className="w-full rounded-lg border object-contain"
                      />
                    )
                  ) : (
                    <div className="bg-muted flex h-64 items-center justify-center rounded-lg border">
                      <div className="text-center">
                        <AlertCircle className="text-muted-foreground mx-auto mb-2 size-12" />
                        <p className="text-muted-foreground">
                          {t('noProofUploaded')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 font-semibold">{t('paymentDetails')}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('status')}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('store')}
                      </p>
                      <p className="font-medium">{payment.storeName}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('owner')}
                      </p>
                      <p className="font-medium">{payment.requestedBy.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {payment.requestedBy.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('tier')}
                      </p>
                      <Badge
                        variant={
                          payment.requestedTier === 'PREMIUM'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {payment.requestedTier}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('amount')}
                      </p>
                      <p className="text-2xl font-bold">
                        ${payment.amount} {payment.currency}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('reference')}
                      </p>
                      <p className="font-mono text-sm">
                        {payment.bankTransferDetails.referenceNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('bankDetails')}
                      </p>
                      <div className="mt-1 space-y-1 text-sm">
                        <p>
                          <span className="font-medium">
                            {payment.bankTransferDetails.bankName}
                          </span>
                        </p>
                        <p>
                          {t('accountNumber')}:{' '}
                          {payment.bankTransferDetails.accountNumber}
                        </p>
                        <p>
                          {t('accountName')}:{' '}
                          {payment.bankTransferDetails.accountName}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t('requestedDate')}
                      </p>
                      <p className="text-sm">
                        {formatDate(payment.requestedAt)}
                      </p>
                    </div>

                    {payment.verifiedAt && (
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {t('verifiedDate')}
                        </p>
                        <p className="text-sm">
                          {formatDate(payment.verifiedAt)}
                        </p>
                      </div>
                    )}

                    {payment.rejectionReason && (
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {t('rejectionReason')}
                        </p>
                        <p className="text-sm text-red-600">
                          {payment.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {payment.status === 'PENDING_VERIFICATION' && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={handleApprove}
                      disabled={
                        !payment.paymentProofUrl ||
                        verifyPayment.isPending ||
                        rejectPayment.isPending
                      }
                    >
                      <CheckCircle className="mr-2 size-4" />
                      {t('approve')}
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => setShowRejectModal(true)}
                      disabled={
                        verifyPayment.isPending || rejectPayment.isPending
                      }
                    >
                      <XCircle className="mr-2 size-4" />
                      {t('reject')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t('paymentNotFound')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">{t('reasonLabel')}</Label>
              <Textarea
                id="rejectionReason"
                placeholder={t('reasonPlaceholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectPayment.isPending}
              >
                {t('confirmReject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
