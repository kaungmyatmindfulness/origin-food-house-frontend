import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  PaymentResponseDto,
  RecordPaymentDto,
  CreateRefundDto,
  RefundResponseDto,
} from '@repo/api/generated/types.gen.js';

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
  const res = await apiFetch<PaymentResponseDto>(
    `/payments/orders/${orderId}/payments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to record payment');
}

/**
 * Get all payments for an order
 * @param orderId - Order ID
 * @returns Array of payments
 */
export async function getOrderPayments(
  orderId: string
): Promise<PaymentResponseDto[]> {
  const res = await apiFetch<PaymentResponseDto[]>(
    `/payments/orders/${orderId}/payments`
  );
  return unwrapData(res, 'Failed to fetch payments');
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
  const res = await apiFetch<RefundResponseDto>(
    `/payments/orders/${orderId}/refunds`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to create refund');
}
