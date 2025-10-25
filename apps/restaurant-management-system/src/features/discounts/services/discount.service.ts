import { apiFetch, unwrapData } from '@/utils/apiFetch';

/**
 * DTO for applying discount to an order
 * Temporary type until backend types are generated
 */
interface ApplyDiscountDto {
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  percentageValue?: string;
  amountValue?: string;
  reason: string;
}

/**
 * Response DTO for discount application
 * Temporary type until backend types are generated
 */
interface DiscountResponseDto {
  id: string;
  orderId: string;
  discountType: string;
  percentageValue?: string;
  amountValue?: string;
  reason: string;
  appliedBy: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdAt: string;
}

/**
 * Apply a discount to an order
 * @param orderId - Order ID
 * @param data - Discount details
 * @returns Discount response
 */
export async function applyDiscount(
  orderId: string,
  data: ApplyDiscountDto
): Promise<DiscountResponseDto> {
  const res = await apiFetch<DiscountResponseDto>(
    `/discounts/orders/${orderId}/discounts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to apply discount');
}

/**
 * Get all discounts for an order
 * @param orderId - Order ID
 * @returns Array of discounts
 */
export async function getOrderDiscounts(
  orderId: string
): Promise<DiscountResponseDto[]> {
  const res = await apiFetch<DiscountResponseDto[]>(
    `/discounts/orders/${orderId}/discounts`
  );
  return unwrapData(res, 'Failed to fetch discounts');
}

/**
 * Approve a discount (Owner/Admin only)
 * @param discountId - Discount ID
 * @returns Updated discount
 */
export async function approveDiscount(
  discountId: string
): Promise<DiscountResponseDto> {
  const res = await apiFetch<DiscountResponseDto>(
    `/discounts/${discountId}/approve`,
    {
      method: 'POST',
    }
  );
  return unwrapData(res, 'Failed to approve discount');
}

/**
 * Reject a discount (Owner/Admin only)
 * @param discountId - Discount ID
 * @param reason - Rejection reason
 * @returns Updated discount
 */
export async function rejectDiscount(
  discountId: string,
  reason: string
): Promise<DiscountResponseDto> {
  const res = await apiFetch<DiscountResponseDto>(
    `/discounts/${discountId}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }
  );
  return unwrapData(res, 'Failed to reject discount');
}
