import { apiFetch, unwrapData } from '@/utils/apiFetch';

/**
 * DTO for calculating bill split
 * Temporary type until backend types are generated
 */
interface CalculateSplitDto {
  splitType: 'EVEN' | 'BY_ITEM' | 'CUSTOM';
  guestCount?: number;
  customSplits?: Array<{ guest: number; amount: string }>;
}

/**
 * Response for split calculation
 * Temporary type until backend types are generated
 */
interface SplitCalculationResponseDto {
  orderId: string;
  grandTotal: string;
  splits: Array<{
    guestNumber: number;
    amount: string;
  }>;
}

/**
 * DTO for recording a split payment
 * Temporary type until backend types are generated
 */
interface RecordSplitPaymentDto {
  paymentMethod:
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'MOBILE_PAYMENT'
    | 'OTHER';
  amount: string;
  splitType: 'EVEN' | 'BY_ITEM' | 'CUSTOM';
  guestNumber: number;
  splitMetadata?: Record<string, unknown>;
  transactionId?: string;
  notes?: string;
}

/**
 * Response for split payment
 * Temporary type until backend types are generated
 */
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
 * Calculate bill split based on split type
 * @param orderId - Order ID
 * @param data - Split calculation parameters
 * @returns Split calculation result
 */
export async function calculateSplit(
  orderId: string,
  data: CalculateSplitDto
): Promise<SplitCalculationResponseDto> {
  const res = await apiFetch<SplitCalculationResponseDto>(
    `/payments/orders/${orderId}/calculate-split`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to calculate split');
}

/**
 * Record a split payment for a specific guest
 * @param orderId - Order ID
 * @param data - Split payment details
 * @returns Payment response
 */
export async function recordSplitPayment(
  orderId: string,
  data: RecordSplitPaymentDto
): Promise<SplitPaymentResponseDto> {
  const res = await apiFetch<SplitPaymentResponseDto>(
    `/payments/orders/${orderId}/split-payments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to record split payment');
}

/**
 * Get all split payments for an order
 * @param orderId - Order ID
 * @returns Array of split payments
 */
export async function getOrderSplitPayments(
  orderId: string
): Promise<SplitPaymentResponseDto[]> {
  const res = await apiFetch<SplitPaymentResponseDto[]>(
    `/payments/orders/${orderId}/split-payments`
  );
  return unwrapData(res, 'Failed to fetch split payments');
}
