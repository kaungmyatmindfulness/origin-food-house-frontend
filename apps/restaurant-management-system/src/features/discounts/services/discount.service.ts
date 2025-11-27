/**
 * Discount Service
 *
 * Service layer for discount-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';

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
  const { data: res, error, response } = await apiClient.POST(
    '/discounts/orders/{orderId}/discounts',
    {
      params: { path: { orderId } },
      body: data,
    }
  );

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to apply discount',
      response.status
    );
  }

  return res.data as DiscountResponseDto;
}

/**
 * Get all discounts for an order
 * @param orderId - Order ID
 * @returns Array of discounts
 */
export async function getOrderDiscounts(
  orderId: string
): Promise<DiscountResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/discounts/orders/{orderId}/discounts',
    {
      params: { path: { orderId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch discounts',
      response.status
    );
  }

  return data.data as DiscountResponseDto[];
}

/**
 * Approve a discount (Owner/Admin only)
 * @param discountId - Discount ID
 * @returns Updated discount
 */
export async function approveDiscount(
  discountId: string
): Promise<DiscountResponseDto> {
  const { data, error, response } = await apiClient.POST(
    '/discounts/{discountId}/approve',
    {
      params: { path: { discountId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to approve discount',
      response.status
    );
  }

  return data.data as DiscountResponseDto;
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
  const { data, error, response } = await apiClient.POST(
    '/discounts/{discountId}/reject',
    {
      params: { path: { discountId } },
      body: { reason },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to reject discount',
      response.status
    );
  }

  return data.data as DiscountResponseDto;
}
