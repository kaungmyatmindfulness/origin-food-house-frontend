/**
 * Admin Payment Hooks
 *
 * React Query hooks for admin payment management.
 * Uses openapi-fetch for type-safe API calls.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/utils/apiFetch';

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
      const queryParams: Record<string, string> = {};
      if (params.status) queryParams.status = params.status;
      if (params.page) queryParams.page = params.page.toString();
      if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

      const { data, error, response } = await apiClient.GET(
        '/admin/payment-requests',
        {
          params: { query: queryParams },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to fetch payment queue',
          response.status
        );
      }

      return data.data as PaymentQueueResponse;
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

      const { data, error, response } = await apiClient.GET(
        '/admin/payment-requests/{paymentRequestId}',
        {
          params: { path: { paymentRequestId } },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to fetch payment request detail',
          response.status
        );
      }

      return data.data as PaymentRequestDetail;
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

      const { data, error, response } = await apiClient.GET(
        '/admin/payment-requests/{paymentRequestId}/payment-proof',
        {
          params: { path: { paymentRequestId } },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to fetch payment proof',
          response.status
        );
      }

      return data.data as PresignedUrlResponse;
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
      const { data, error, response } = await apiClient.GET('/admin/metrics', {});

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to fetch admin metrics',
          response.status
        );
      }

      return data.data as AdminMetrics;
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
      const { data, error, response } = await apiClient.POST(
        '/admin/payment-requests/{paymentRequestId}/verify',
        {
          params: { path: { paymentRequestId } },
          body: { notes },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to verify payment',
          response.status
        );
      }

      return data.data as { success: boolean; message: string };
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
      const { data, error, response } = await apiClient.POST(
        '/admin/payment-requests/{paymentRequestId}/reject',
        {
          params: { path: { paymentRequestId } },
          body: { reason },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to reject payment',
          response.status
        );
      }

      return data.data as { success: boolean; message: string };
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
      const { data, error, response } = await apiClient.POST(
        '/admin/payment-requests/bulk-verify',
        {
          body: { paymentRequestIds },
        }
      );

      if (error || !data?.data) {
        throw new ApiError(
          data?.message || 'Failed to bulk verify payments',
          response.status
        );
      }

      return data.data as {
        success: boolean;
        verified: number;
        failed: number;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.metrics() });
    },
  });
}
