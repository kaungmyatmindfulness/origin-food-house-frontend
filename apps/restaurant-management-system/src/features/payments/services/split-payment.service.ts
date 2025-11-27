/**
 * Split Payment Service
 *
 * Service layer for bill splitting API operations.
 * Note: Uses raw fetch for endpoints not in OpenAPI spec.
 */

import { ApiError } from '@/utils/apiFetch';
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

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/calculate-split`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to calculate split', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<SplitCalculationResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to calculate split', response.status);
  }

  return json.data;
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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/split-payments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to record split payment', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<SplitPaymentResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to record split payment', response.status);
  }

  return json.data;
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
  const response = await fetch(
    `${baseUrl}/payments/orders/${orderId}/split-payments`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to fetch split payments', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<SplitPaymentResponseDto[]>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to fetch split payments', response.status);
  }

  return json.data;
}
