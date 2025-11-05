'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { usePaymentQueue } from '../hooks/useAdminPayments';

interface PaymentRequestQueueProps {
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  onViewPayment: (paymentId: string) => void;
}

export function PaymentRequestQueue({
  status,
  onViewPayment,
}: PaymentRequestQueueProps) {
  const t = useTranslations('admin.payments');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = usePaymentQueue({ status, page, pageSize });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTierBadgeVariant = (tier: 'STANDARD' | 'PREMIUM') => {
    return tier === 'PREMIUM' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('noPaymentRequests')}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.meta.total / pageSize);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('store')}</TableHead>
            <TableHead>{t('tier')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{t('reference')}</TableHead>
            <TableHead>{t('requestedBy')}</TableHead>
            <TableHead>{t('uploadedDate')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((payment) => (
            <TableRow
              key={payment.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onViewPayment(payment.id)}
            >
              <TableCell className="font-medium">{payment.storeName}</TableCell>
              <TableCell>
                <Badge variant={getTierBadgeVariant(payment.requestedTier)}>
                  {payment.requestedTier}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">${payment.amount}</TableCell>
              <TableCell className="font-mono text-sm">
                {payment.referenceNumber}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{payment.requestedBy.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {payment.requestedBy.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(payment.requestedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPayment(payment.id);
                  }}
                >
                  <Eye className="mr-2 size-4" />
                  {t('viewProof')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t('showing', {
            start: (page - 1) * pageSize + 1,
            end: Math.min(page * pageSize, data.meta.total),
            total: data.meta.total,
          })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4" />
            {t('previous')}
          </Button>
          <div className="flex items-center gap-1 px-4">
            <span className="text-sm">
              {t('page')} {page} {t('of')} {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            {t('next')}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
