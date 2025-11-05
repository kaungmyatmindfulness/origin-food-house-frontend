import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, unwrapData } from '@/utils/apiFetch';

interface PaymentQueueParams {
  status?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  page?: number;
  pageSize?: number;
}

interface PaymentQueueItem {
  id: string;
  storeName: string;
  requestedTier: 'STANDARD' | 'PREMIUM';
  amount: string;
  referenceNumber: string;
  requestedAt: string;
  requestedBy: {
    userId: string;
    email: string;
    name: string;
  };
  paymentProofUrl?: string;
}

interface PaymentQueueResponse {
  data: PaymentQueueItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pendingCount: number;
  };
}

interface PaymentRequestDetail {
  id: string;
  subscriptionId: string;
  requestedTier: 'STANDARD' | 'PREMIUM';
  amount: string;
  currency: 'USD';
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'ACTIVATED' | 'REJECTED';
  requestedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  storeName: string;
  requestedBy: {
    userId: string;
    email: string;
    name: string;
  };
  paymentProofUrl?: string;
  paymentProofPresignedUrl?: string;
  bankTransferDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    referenceNumber: string;
  };
}

interface PresignedUrlResponse {
  presignedUrl: string;
  expiresAt: string;
}

interface AdminMetrics {
  pendingCount: number;
  verifiedToday: number;
  rejectedToday: number;
  avgVerificationTimeHours: number;
  verificationTrend: {
    date: string;
    verified: number;
  }[];
  tierDistribution: {
    STANDARD: number;
    PREMIUM: number;
  };
}

export const adminPaymentKeys = {
  all: ['admin', 'payment-requests'] as const,
  queue: (params: PaymentQueueParams) =>
    [...adminPaymentKeys.all, 'queue', params] as const,
  detail: (id: string) => [...adminPaymentKeys.all, 'detail', id] as const,
  metrics: () => [...adminPaymentKeys.all, 'metrics'] as const,
};

/**
 * Hook to fetch payment queue with pagination and filtering
 */
export function usePaymentQueue(params: PaymentQueueParams) {
  return useQuery({
    queryKey: adminPaymentKeys.queue(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.pageSize)
        searchParams.set('pageSize', params.pageSize.toString());

      const res = await apiFetch<PaymentQueueResponse>(
        `/admin/payment-requests?${searchParams.toString()}`
      );
      return unwrapData(res, 'Failed to fetch payment queue');
    },
  });
}

/**
 * Hook to fetch payment request detail
 */
export function usePaymentRequestDetail(paymentRequestId: string | null) {
  return useQuery({
    queryKey: adminPaymentKeys.detail(paymentRequestId || ''),
    queryFn: async () => {
      if (!paymentRequestId) return null;
      const res = await apiFetch<PaymentRequestDetail>(
        `/admin/payment-requests/${paymentRequestId}`
      );
      return unwrapData(res, 'Failed to fetch payment request detail');
    },
    enabled: !!paymentRequestId,
  });
}

/**
 * Hook to fetch payment proof presigned URL
 */
export function usePaymentProof(paymentRequestId: string | null) {
  return useQuery({
    queryKey: [...adminPaymentKeys.detail(paymentRequestId || ''), 'proof'],
    queryFn: async () => {
      if (!paymentRequestId) return null;
      const res = await apiFetch<PresignedUrlResponse>(
        `/admin/payment-requests/${paymentRequestId}/payment-proof`
      );
      return unwrapData(res, 'Failed to fetch payment proof');
    },
    enabled: !!paymentRequestId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch admin metrics
 */
export function useAdminMetrics() {
  return useQuery({
    queryKey: adminPaymentKeys.metrics(),
    queryFn: async () => {
      const res = await apiFetch<AdminMetrics>('/admin/metrics');
      return unwrapData(res, 'Failed to fetch admin metrics');
    },
    refetchInterval: 60 * 1000,
  });
}

/**
 * Hook to verify payment request (approve)
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentRequestId,
      notes,
    }: {
      paymentRequestId: string;
      notes?: string;
    }) => {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/admin/payment-requests/${paymentRequestId}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        }
      );
      return unwrapData(res, 'Failed to verify payment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.metrics() });
    },
  });
}

/**
 * Hook to reject payment request
 */
export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentRequestId,
      reason,
    }: {
      paymentRequestId: string;
      reason: string;
    }) => {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/admin/payment-requests/${paymentRequestId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        }
      );
      return unwrapData(res, 'Failed to reject payment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.metrics() });
    },
  });
}

/**
 * Hook to bulk verify payment requests
 */
export function useBulkVerifyPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentRequestIds,
    }: {
      paymentRequestIds: string[];
    }) => {
      const res = await apiFetch<{
        success: boolean;
        verified: number;
        failed: number;
      }>('/admin/payment-requests/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRequestIds }),
      });
      return unwrapData(res, 'Failed to bulk verify payments');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.metrics() });
    },
  });
}
