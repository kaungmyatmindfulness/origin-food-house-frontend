/**
 * Quick Sale Checkout Service
 *
 * Service layer for quick sale checkout API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { OrderResponseDto } from '@repo/api/generated/types';

/**
 * Item for quick sale order.
 * Note: This type is defined locally as it's not yet in the generated types.
 */
export interface QuickSaleItemDto {
  menuItemId: string;
  quantity: number;
  customizationOptionIds?: string[];
  notes?: string;
}

/** Session type for quick sale */
type SessionType = 'COUNTER' | 'PHONE' | 'TAKEOUT' | 'TABLE';

/** Parameters for quick sale checkout */
interface QuickSaleCheckoutParams {
  storeId: string;
  sessionType: Exclude<SessionType, 'TABLE'>;
  items: QuickSaleItemDto[];
  customerName?: string;
  customerPhone?: string;
  orderNotes?: string;
}

/** Result of quick sale checkout */
export interface QuickSaleCheckoutResult {
  orderId: string;
  orderNumber: string;
  sessionId: string;
  grandTotal: string;
}

/**
 * Gets order type based on session type.
 *
 * @param sessionType - The session type
 * @returns Order type
 */
export function getOrderTypeFromSessionType(
  sessionType: SessionType
): 'DINE_IN' | 'TAKEAWAY' {
  switch (sessionType) {
    case 'COUNTER':
    case 'TABLE':
      return 'DINE_IN';
    case 'PHONE':
    case 'TAKEOUT':
      return 'TAKEAWAY';
    default:
      return 'DINE_IN';
  }
}

/**
 * Completes quick sale checkout using optimized single-call API.
 * Creates session, cart, and order in a single atomic transaction.
 *
 * @param params - Checkout parameters
 * @returns Checkout result with order details
 * @throws {ApiError} If the request fails
 * @throws {Error} If cart is empty or session ID is missing
 */
export async function quickSaleCheckout(
  params: QuickSaleCheckoutParams
): Promise<QuickSaleCheckoutResult> {
  const {
    storeId,
    sessionType,
    items,
    customerName,
    customerPhone,
    orderNotes,
  } = params;

  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  const orderType = getOrderTypeFromSessionType(sessionType);

  const { data, error, response } = await apiClient.POST(
    '/orders/quick-checkout',
    {
      body: {
        storeId,
        sessionType,
        orderType,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          customizationOptionIds: item.customizationOptionIds,
          notes: item.notes,
        })),
        customerName,
        customerPhone,
        orderNotes,
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      String(data?.message ?? 'Failed to checkout'),
      response.status
    );
  }

  const order = data.data as OrderResponseDto;

  if (!order.sessionId) {
    throw new Error('Session ID missing in checkout response');
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    sessionId: order.sessionId,
    grandTotal: order.grandTotal,
  };
}
