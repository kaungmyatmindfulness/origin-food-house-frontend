/**
 * Types for Sales feature UI state and operations.
 * These types are used for client-side state management and component props.
 */

import type { MenuItemResponseDto } from '@repo/api/generated/types';

// Re-export types from generated schemas
export type {
  CartItemResponseDto,
  CartResponseDto,
  OrderItemResponseDto,
  OrderResponseDto,
  MenuItemResponseDto,
} from '@repo/api/generated/types';

/**
 * Extended menu item type for sales display.
 * Uses MenuItemResponseDto with proper nullable string types.
 */
export type SalesMenuItem = MenuItemResponseDto;

/**
 * View mode for the sales interface
 * - quick-sale: Counter/takeout ordering without table assignment
 * - tables: Table-based ordering with table selection
 */
export type SalesView = 'quick-sale' | 'tables';

/**
 * Active panel in the sales sidebar
 * - cart: Shows current cart items and allows modifications
 * - payment: Shows payment options and processes transaction
 * - receipt: Shows completed order receipt
 */
export type SalesPanel = 'cart' | 'payment' | 'receipt';

/**
 * Type of ordering session
 * - COUNTER: Walk-in customer ordering at counter
 * - PHONE: Phone order for pickup
 * - TAKEOUT: Takeout/to-go order
 * - TABLE: Dine-in order assigned to a table
 */
export type SessionType = 'COUNTER' | 'PHONE' | 'TAKEOUT' | 'TABLE';

/**
 * Payment method types for recording transactions
 * Note: This is for record-keeping only, actual payment processing
 * is handled externally
 */
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'OTHER';

/**
 * Input for cash payment calculations
 */
export interface CashPaymentInput {
  /** Total order amount to be paid */
  orderTotal: number;
  /** Amount of cash tendered by customer */
  amountTendered: number;
}

/**
 * Result of cash payment calculation
 */
export interface CashPaymentResult {
  /** Change due back to customer */
  changeDue: number;
  /** Whether the payment is valid (amount tendered >= order total) */
  isValid: boolean;
  /** Error message if payment is invalid */
  errorMessage?: string;
}

/**
 * Input for quickly adding an item to the cart
 */
export interface QuickAddItem {
  /** ID of the menu item to add */
  menuItemId: string;
  /** Quantity to add */
  quantity: number;
  /** Optional special instructions or notes */
  notes?: string;
  /** Selected customization options */
  customizations?: Array<{
    customizationOptionId: string;
  }>;
  /** Whether this item is for takeaway (affects packaging) */
  isForTakeaway?: boolean;
}

/**
 * Filter options for the menu grid in sales view
 */
export interface SalesMenuFilters {
  /** Filter by category ID */
  categoryId?: string;
  /** Search query for item name */
  searchQuery?: string;
  /** Whether to show out-of-stock items */
  showOutOfStock?: boolean;
}

/**
 * Summary information for active orders display
 */
export interface ActiveOrderSummary {
  /** Order ID */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Session type (COUNTER, TABLE, etc.) */
  sessionType: SessionType;
  /** Table number if applicable */
  tableNumber?: string;
  /** Total item count */
  itemCount: number;
  /** Order total amount */
  total: number;
  /** Order status */
  status: string;
  /** Time since order was created */
  createdAt: string;
}
