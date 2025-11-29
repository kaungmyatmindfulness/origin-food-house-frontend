/**
 * Transforms order API response data into receipt panel format.
 * This utility handles the mismatch between API response types and ReceiptPanel expectations.
 */

import type {
  OrderResponseDto,
  OrderItemResponseDto,
} from '@repo/api/generated/types';
import type { SessionType } from '../types/sales.types';

/**
 * Session information for receipt display
 */
export interface ReceiptSession {
  sessionType?: SessionType;
  customerName?: string | null;
  customerPhone?: string | null;
}

/**
 * Order payment data for receipt display.
 * Note: This differs from PaymentResponseDto which is for subscription payments.
 */
export interface OrderPayment {
  id?: string;
  amount: string | number;
  paymentMethod?: string;
  amountTendered?: string | number;
  change?: string | number;
}

/**
 * Extended order item for receipt display
 */
interface ReceiptOrderItem {
  id: string;
  menuItemId: string | null;
  menuItemName: string;
  price: string;
  quantity: number;
  finalPrice: string | null;
  notes: string | null;
}

/**
 * Receipt order data structure expected by ReceiptPanel
 */
export interface ReceiptOrderData
  extends Omit<
    OrderResponseDto,
    'orderItems' | 'discountAmount' | 'tableName'
  > {
  orderItems: ReceiptOrderItem[];
  payments?: OrderPayment[];
  taxAmount?: string;
  discountAmount?: string;
  tableName?: string;
  session?: ReceiptSession | null;
}

/**
 * Extended order item type that may include menuItemName from the API
 */
interface OrderItemWithMenuName extends OrderItemResponseDto {
  menuItemName?: string;
}

/**
 * Extended order response that may include payments from the API.
 */
interface OrderWithPayments extends OrderResponseDto {
  payments?: OrderPayment[];
  session?: ReceiptSession | null;
}

/**
 * Transforms an order API response into the format expected by ReceiptPanel.
 *
 * This handles:
 * - Converting orderItems to include menuItemName (with fallback to 'Item')
 * - Including payments array if present
 * - Preserving session information
 *
 * @param order - The order response from the API
 * @returns Transformed data for ReceiptPanel
 */
export function transformOrderToReceiptData(
  order: OrderWithPayments
): ReceiptOrderData {
  // Extract properties that need transformation
  const { orderItems, discountAmount, ...rest } = order;

  return {
    ...rest,
    // Convert null discountAmount to undefined for optional field
    discountAmount: discountAmount ?? undefined,
    orderItems:
      orderItems?.map((item) => {
        const extendedItem = item as OrderItemWithMenuName;
        return {
          id: extendedItem.id,
          menuItemId: extendedItem.menuItemId ?? null,
          // Use menuItemName from API if available, otherwise fallback
          menuItemName: extendedItem.menuItemName ?? 'Item',
          price: extendedItem.price,
          quantity: extendedItem.quantity,
          finalPrice: extendedItem.finalPrice,
          notes: extendedItem.notes ?? null,
        };
      }) ?? [],
    payments: order.payments,
    session: order.session,
  };
}
