/**
 * Payment Service
 *
 * Service layer for payment-related API operations.
 * Note: Uses raw fetch for endpoints not in OpenAPI spec.
 */

import { ApiError } from '@/utils/apiFetch';
import type {
  PaymentResponseDto,
  RecordPaymentDto,
  CreateRefundDto,
  RefundResponseDto,
} from '@repo/api/generated/types';

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/payments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to record payment', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<PaymentResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to record payment', response.status);
  }

  return json.data;
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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/payments`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to fetch payments', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<PaymentResponseDto[]>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to fetch payments', response.status);
  }

  return json.data;
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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/refunds`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to create refund', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<RefundResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to create refund', response.status);
  }

  return json.data;
}
