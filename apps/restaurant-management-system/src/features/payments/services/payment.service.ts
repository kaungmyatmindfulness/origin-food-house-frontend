/**
 * Payment Service
 *
 * Service layer for payment-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  PaymentResponseDto,
  RecordPaymentDto,
  CreateRefundDto,
  RefundResponseDto,
} from '@repo/api/generated/types';

/**
 * Record a payment for an order
 * @param orderId - Order ID
 * @param data - Payment details
 * @returns Payment response
 */
export async function recordPayment(
  orderId: string,
  data: RecordPaymentDto
): Promise<PaymentResponseDto> {
  const { data: res, error, response } = await apiClient.POST(
    '/payments/orders/{orderId}/payments',
    {
      params: { path: { orderId } },
      body: data,
    }
  );

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to record payment',
      response.status
    );
  }

  return res.data as PaymentResponseDto;
}

/**
 * Get all payments for an order
 * @param orderId - Order ID
 * @returns Array of payments
 */
export async function getOrderPayments(
  orderId: string
): Promise<PaymentResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/payments/orders/{orderId}/payments',
    {
      params: { path: { orderId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch payments',
      response.status
    );
  }

  return data.data as PaymentResponseDto[];
}

/**
 * Create a refund for an order
 * @param orderId - Order ID
 * @param data - Refund details
 * @returns Refund response
 */
export async function createRefund(
  orderId: string,
  data: CreateRefundDto
): Promise<RefundResponseDto> {
  const { data: res, error, response } = await apiClient.POST(
    '/payments/orders/{orderId}/refunds',
    {
      params: { path: { orderId } },
      body: data,
    }
  );

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to create refund',
      response.status
    );
  }

  return res.data as RefundResponseDto;
}
