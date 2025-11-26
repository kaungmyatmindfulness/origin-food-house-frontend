/**
 * Transforms order API response data into receipt panel format.
 * This utility handles the mismatch between API response types and ReceiptPanel expectations.
 */

import type {
  OrderResponseDto,
  PaymentResponseDto,
} from '@repo/api/generated/types';
import type { SessionType } from '../types/sales.types';

/**
 * Session information for receipt display
 */
interface ReceiptSession {
  sessionType?: SessionType;
  customerName?: string | null;
  customerPhone?: string | null;
}

/**
 * Extended order item for receipt display
 */
interface ReceiptOrderItem {
  id: string;
  menuItemId: { [key: string]: unknown };
  menuItemName: string;
  price: string;
  quantity: number;
  finalPrice: string;
  notes: { [key: string]: unknown };
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
  payments?: PaymentResponseDto[];
  taxAmount?: string;
  discountAmount?: string;
  tableName?: string;
  session?: ReceiptSession | null;
}

/**
 * Extended order item type that may include menuItemName from the API
 */
interface OrderItemWithMenuName {
  id: string;
  menuItemId: string;
  menuItemName?: string;
  price: string;
  quantity: number;
  finalPrice: string;
  notes?: string | null;
}

/**
 * Extended order response that may include payments from the API
 */
interface OrderWithPayments extends OrderResponseDto {
  payments?: PaymentResponseDto[];
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
  return {
    ...order,
    orderItems:
      order.orderItems?.map((item) => {
        // Cast to extended type to access potential menuItemName
        const extendedItem = item as unknown as OrderItemWithMenuName;
        return {
          id: extendedItem.id,
          menuItemId: extendedItem.menuItemId as unknown as {
            [key: string]: unknown;
          },
          // Use menuItemName from API if available, otherwise fallback
          // TODO: Request backend to always include menuItemName in order items
          menuItemName: extendedItem.menuItemName ?? 'Item',
          price: extendedItem.price,
          quantity: extendedItem.quantity,
          finalPrice: extendedItem.finalPrice,
          notes: (extendedItem.notes ?? null) as unknown as {
            [key: string]: unknown;
          },
        };
      }) ?? [],
    payments: order.payments,
    session: order.session,
  };
}
