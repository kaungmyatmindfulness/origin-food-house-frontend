/**
 * Payment Service
 *
 * Service layer for payment-related API operations.
 * Note: Uses typedFetch for endpoints not in OpenAPI spec.
 */

import { typedFetch } from '@/utils/typed-fetch';

import type {
  PaymentResponseDto,
  RecordPaymentDto,
  CreateRefundDto,
  RefundResponseDto,
} from '@repo/api/generated/types';

/**
 * Records a payment for an order.
 *
 * @param orderId - The order ID
 * @param data - Payment details
 * @returns Payment response
 * @throws {ApiError} If the request fails
 */
export async function recordPayment(
  orderId: string,
  data: RecordPaymentDto
): Promise<PaymentResponseDto> {
  return typedFetch<PaymentResponseDto>(
    `/payments/orders/${orderId}/payments`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * Gets all payments for an order.
 *
 * @param orderId - The order ID
 * @returns Array of payments
 * @throws {ApiError} If the request fails
 */
export async function getOrderPayments(
  orderId: string
): Promise<PaymentResponseDto[]> {
  return typedFetch<PaymentResponseDto[]>(
    `/payments/orders/${orderId}/payments`
  );
}

/**
 * Creates a refund for an order.
 *
 * @param orderId - The order ID
 * @param data - Refund details
 * @returns Refund response
 * @throws {ApiError} If the request fails
 */
export async function createRefund(
  orderId: string,
  data: CreateRefundDto
): Promise<RefundResponseDto> {
  return typedFetch<RefundResponseDto>(`/payments/orders/${orderId}/refunds`, {
    method: 'POST',
    body: data,
  });
}
