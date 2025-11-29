/**
 * Split Payment Service
 *
 * Service layer for bill splitting API operations.
 * Note: Uses typedFetch for endpoints not in OpenAPI spec.
 */

import { typedFetch } from '@/utils/typed-fetch';

import type {
  CalculateSplitDto,
  RecordSplitPaymentDto,
} from '@repo/api/generated/types';

/** Response for split calculation */
interface SplitCalculationResponseDto {
  orderId: string;
  grandTotal: string;
  splits: Array<{
    guestNumber: number;
    amount: string;
  }>;
}

/** Response for split payment */
interface SplitPaymentResponseDto {
  id: string;
  orderId: string;
  paymentMethod: string;
  amount: string;
  splitType: string;
  guestNumber: number;
  splitMetadata?: Record<string, unknown>;
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

/**
 * Calculates bill split based on split type.
 *
 * @param orderId - The order ID
 * @param data - Split calculation parameters
 * @returns Split calculation result
 * @throws {ApiError} If the request fails
 */
export async function calculateSplit(
  orderId: string,
  data: CalculateSplitDto
): Promise<SplitCalculationResponseDto> {
  return typedFetch<SplitCalculationResponseDto>(
    `/payments/orders/${orderId}/calculate-split`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * Records a split payment for a specific guest.
 *
 * @param orderId - The order ID
 * @param data - Split payment details
 * @returns Payment response
 * @throws {ApiError} If the request fails
 */
export async function recordSplitPayment(
  orderId: string,
  data: RecordSplitPaymentDto
): Promise<SplitPaymentResponseDto> {
  return typedFetch<SplitPaymentResponseDto>(
    `/payments/orders/${orderId}/split-payments`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * Gets all split payments for an order.
 *
 * @param orderId - The order ID
 * @returns Array of split payments
 * @throws {ApiError} If the request fails
 */
export async function getOrderSplitPayments(
  orderId: string
): Promise<SplitPaymentResponseDto[]> {
  return typedFetch<SplitPaymentResponseDto[]>(
    `/payments/orders/${orderId}/split-payments`
  );
}
