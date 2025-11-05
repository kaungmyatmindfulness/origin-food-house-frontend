import { apiFetch, unwrapData } from '@/utils/apiFetch';
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
  const res = await apiFetch<Subscription>(`/subscriptions/stores/${storeId}`);
  return unwrapData(res, 'Failed to fetch subscription');
}

export async function getTrialEligibility(
  userId: string
): Promise<TrialEligibility> {
  const res = await apiFetch<TrialEligibility>({
    path: '/subscriptions/trial-eligibility',
    query: { userId },
  });
  return unwrapData(res, 'Failed to check trial eligibility');
}

export async function getTrialStatus(storeId: string): Promise<TrialStatus> {
  const res = await apiFetch<TrialStatus>(
    `/subscriptions/stores/${storeId}/trial`
  );
  return unwrapData(res, 'Failed to fetch trial status');
}

export async function createPaymentRequest(data: {
  storeId: string;
  requestedTier: SubscriptionTier;
}): Promise<PaymentRequest> {
  const res = await apiFetch<PaymentRequest>(
    '/subscriptions/payment-requests',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to create payment request');
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
    throw new Error('Failed to upload payment proof');
  }

  return res.json();
}

export async function getPaymentRequest(id: string): Promise<PaymentRequest> {
  const res = await apiFetch<PaymentRequest>(
    `/subscriptions/payment-requests/${id}`
  );
  return unwrapData(res, 'Failed to fetch payment request');
}

export async function getPaymentRequests(storeId: string): Promise<{
  data: PaymentRequest[];
  meta: { total: number; page: number; pageSize: number };
}> {
  const res = await apiFetch<{
    data: PaymentRequest[];
    meta: { total: number; page: number; pageSize: number };
  }>({
    path: '/subscriptions/payment-requests',
    query: { storeId },
  });
  return unwrapData(res, 'Failed to fetch payment requests');
}

export async function createRefundRequest(data: {
  storeId: string;
  reason: RefundReason;
  comments?: string;
}): Promise<RefundRequest> {
  const res = await apiFetch<RefundRequest>('/subscriptions/refund-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData(res, 'Failed to create refund request');
}

export async function getRefundRequests(
  storeId: string
): Promise<{ data: RefundRequest[] }> {
  const res = await apiFetch<{ data: RefundRequest[] }>({
    path: '/subscriptions/refund-requests',
    query: { storeId },
  });
  return unwrapData(res, 'Failed to fetch refund requests');
}

export async function initiateOwnershipTransfer(
  storeId: string,
  newOwnerEmail: string
): Promise<OwnershipTransfer> {
  const res = await apiFetch<OwnershipTransfer>(
    `/subscriptions/stores/${storeId}/transfer-ownership`,
    {
      method: 'POST',
      body: JSON.stringify({ newOwnerEmail }),
    }
  );
  return unwrapData(res, 'Failed to initiate ownership transfer');
}

export async function verifyOwnershipTransferOTP(
  transferId: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    `/subscriptions/transfer/${transferId}/verify-otp`,
    {
      method: 'POST',
      body: JSON.stringify({ otpCode }),
    }
  );
  return unwrapData(res, 'Failed to verify OTP');
}

export async function cancelOwnershipTransfer(
  transferId: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch<{ success: boolean; message: string }>(
    `/subscriptions/transfer/${transferId}`,
    {
      method: 'DELETE',
    }
  );
  return unwrapData(res, 'Failed to cancel transfer');
}
