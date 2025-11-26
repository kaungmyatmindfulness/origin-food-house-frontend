import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { OrderResponseDto } from '@repo/api/generated/types';

import type { DraftCartItem } from '../store/quick-sale-cart.store';
import type { SessionType } from '../types/sales.types';

/**
 * Parameters for quick sale checkout
 */
export interface QuickSaleCheckoutParams {
  storeId: string;
  sessionType: Exclude<SessionType, 'TABLE'>;
  items: DraftCartItem[];
  customerName?: string;
  customerPhone?: string;
  orderNotes?: string;
}

/**
 * Result of quick sale checkout
 */
export interface QuickSaleCheckoutResult {
  orderId: string;
  orderNumber: string;
  sessionId: string;
  grandTotal: string;
}

/**
 * Complete quick sale checkout process using the optimized single-call API
 *
 * This function uses the /orders/quick-checkout endpoint which:
 * - Creates session, cart, and order in a single atomic transaction
 * - Significantly faster than the multi-step approach
 * - Reduces network round trips from 3+ to 1
 *
 * @param params - Checkout parameters including items, session type, and customer info
 * @returns Checkout result with order details
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

  // Determine order type based on session type
  const orderType = getOrderTypeFromSessionType(sessionType);

  // Single API call for quick checkout
  const res = await apiFetch<OrderResponseDto>('/orders/quick-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeId,
      sessionType,
      orderType,
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customizationOptionIds: item.customizations.map((c) => c.optionId),
        notes: item.notes,
      })),
      customerName,
      customerPhone,
      orderNotes,
    }),
  });

  const order = unwrapData(res, 'Failed to checkout');

  // sessionId should always be present for quick checkout orders
  // since we create the session as part of the checkout
  // Note: sessionId is typed as { [key: string]: unknown } in auto-generated types
  // but at runtime it's a string UUID
  const sessionId = order.sessionId as unknown as string | null;
  if (!sessionId) {
    throw new Error('Session ID missing in checkout response');
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    sessionId,
    grandTotal: order.grandTotal,
  };
}

/**
 * Get order type based on session type
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
