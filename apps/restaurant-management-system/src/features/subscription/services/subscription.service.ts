/**
 * Subscription Service
 *
 * Service layer for subscription-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  Subscription,
  PaymentRequest,
  RefundRequest,
  OwnershipTransfer,
  TrialEligibility,
  TrialStatus,
  RefundReason,
  SubscriptionTier,
} from '../types/subscription.types';

export async function getSubscription(storeId: string): Promise<Subscription> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/stores/{storeId}',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch subscription',
      response.status
    );
  }

  return data.data as Subscription;
}

export async function getTrialEligibility(
  userId: string
): Promise<TrialEligibility> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/trial-eligibility',
    {
      params: { query: { userId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to check trial eligibility',
      response.status
    );
  }

  return data.data as TrialEligibility;
}

export async function getTrialStatus(storeId: string): Promise<TrialStatus> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/stores/{storeId}/trial',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch trial status',
      response.status
    );
  }

  return data.data as TrialStatus;
}

export async function createPaymentRequest(paymentData: {
  storeId: string;
  requestedTier: SubscriptionTier;
}): Promise<PaymentRequest> {
  const { data, error, response } = await apiClient.POST(
    '/subscriptions/payment-requests',
    {
      body: paymentData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to create payment request',
      response.status
    );
  }

  return data.data as PaymentRequest;
}

export async function uploadPaymentProof(
  paymentRequestId: string,
  file: File
): Promise<{ success: boolean; paymentProofUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(
    `${baseUrl}/subscriptions/payment-requests/${paymentRequestId}/upload-proof`,
    {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }
  );

  if (!res.ok) {
    throw new ApiError('Failed to upload payment proof', res.status);
  }

  return res.json();
}

export async function getPaymentRequest(id: string): Promise<PaymentRequest> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/payment-requests/{id}',
    {
      params: { path: { id } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch payment request',
      response.status
    );
  }

  return data.data as PaymentRequest;
}

export async function getPaymentRequests(storeId: string): Promise<{
  data: PaymentRequest[];
  meta: { total: number; page: number; pageSize: number };
}> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/payment-requests',
    {
      params: { query: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch payment requests',
      response.status
    );
  }

  return data.data as {
    data: PaymentRequest[];
    meta: { total: number; page: number; pageSize: number };
  };
}

export async function createRefundRequest(refundData: {
  storeId: string;
  reason: RefundReason;
  comments?: string;
}): Promise<RefundRequest> {
  const { data, error, response } = await apiClient.POST(
    '/subscriptions/refund-requests',
    {
      body: refundData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to create refund request',
      response.status
    );
  }

  return data.data as RefundRequest;
}

export async function getRefundRequests(
  storeId: string
): Promise<{ data: RefundRequest[] }> {
  const { data, error, response } = await apiClient.GET(
    '/subscriptions/refund-requests',
    {
      params: { query: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch refund requests',
      response.status
    );
  }

  return data.data as { data: RefundRequest[] };
}

export async function initiateOwnershipTransfer(
  storeId: string,
  newOwnerEmail: string
): Promise<OwnershipTransfer> {
  const { data, error, response } = await apiClient.POST(
    '/subscriptions/stores/{storeId}/transfer-ownership',
    {
      params: { path: { storeId } },
      body: { newOwnerEmail },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to initiate ownership transfer',
      response.status
    );
  }

  return data.data as OwnershipTransfer;
}

export async function verifyOwnershipTransferOTP(
  transferId: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  const { data, error, response } = await apiClient.POST(
    '/subscriptions/transfer/{transferId}/verify-otp',
    {
      params: { path: { transferId } },
      body: { otpCode },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to verify OTP',
      response.status
    );
  }

  return data.data as { success: boolean; message: string };
}

export async function cancelOwnershipTransfer(
  transferId: string
): Promise<{ success: boolean; message: string }> {
  const { data, error, response } = await apiClient.DELETE(
    '/subscriptions/transfer/{transferId}',
    {
      params: { path: { transferId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to cancel transfer',
      response.status
    );
  }

  return data.data as { success: boolean; message: string };
}
