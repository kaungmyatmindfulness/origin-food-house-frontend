import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  SubscriptionTier,
  RefundReason,
} from '../types/subscription.types';
import {
  getSubscription,
  getTrialEligibility,
  getTrialStatus,
  createPaymentRequest,
  uploadPaymentProof,
  getPaymentRequest,
  getPaymentRequests,
  createRefundRequest,
  getRefundRequests,
  initiateOwnershipTransfer,
  verifyOwnershipTransferOTP,
  cancelOwnershipTransfer,
} from '../services/subscription.service';
import { subscriptionKeys } from '../queries/subscription.keys';

export function useSubscription(storeId: string) {
  return useQuery({
    queryKey: subscriptionKeys.subscription(storeId),
    queryFn: () => getSubscription(storeId),
    enabled: !!storeId,
  });
}

export function useTrialEligibility(userId: string) {
  return useQuery({
    queryKey: subscriptionKeys.trialEligibility(userId),
    queryFn: () => getTrialEligibility(userId),
    enabled: !!userId,
  });
}

export function useTrialStatus(storeId: string) {
  return useQuery({
    queryKey: subscriptionKeys.trialStatus(storeId),
    queryFn: () => getTrialStatus(storeId),
    enabled: !!storeId,
  });
}

export function useCreatePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { storeId: string; requestedTier: SubscriptionTier }) =>
      createPaymentRequest(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.subscription(variables.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.paymentRequestsList(variables.storeId),
      });
    },
  });
}

export function useUploadPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentRequestId,
      file,
    }: {
      paymentRequestId: string;
      file: File;
    }) => uploadPaymentProof(paymentRequestId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.paymentRequest(variables.paymentRequestId),
      });
    },
  });
}

export function usePaymentRequest(
  id: string,
  options?: { refetchInterval?: number | ((data: unknown) => number | false) }
) {
  return useQuery({
    queryKey: subscriptionKeys.paymentRequest(id),
    queryFn: () => getPaymentRequest(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

export function usePaymentRequests(storeId: string) {
  return useQuery({
    queryKey: subscriptionKeys.paymentRequestsList(storeId),
    queryFn: () => getPaymentRequests(storeId),
    enabled: !!storeId,
  });
}

export function useCreateRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      storeId: string;
      reason: RefundReason;
      comments?: string;
    }) => createRefundRequest(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.subscription(variables.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.refundRequestsList(variables.storeId),
      });
    },
  });
}

export function useRefundRequests(storeId: string) {
  return useQuery({
    queryKey: subscriptionKeys.refundRequestsList(storeId),
    queryFn: () => getRefundRequests(storeId),
    enabled: !!storeId,
  });
}

export function useInitiateOwnershipTransfer() {
  return useMutation({
    mutationFn: ({
      storeId,
      newOwnerEmail,
    }: {
      storeId: string;
      newOwnerEmail: string;
    }) => initiateOwnershipTransfer(storeId, newOwnerEmail),
  });
}

export function useVerifyOwnershipTransferOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transferId,
      otpCode,
    }: {
      transferId: string;
      otpCode: string;
    }) => verifyOwnershipTransferOTP(transferId, otpCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.all,
      });
    },
  });
}

export function useCancelOwnershipTransfer() {
  return useMutation({
    mutationFn: (transferId: string) => cancelOwnershipTransfer(transferId),
  });
}
