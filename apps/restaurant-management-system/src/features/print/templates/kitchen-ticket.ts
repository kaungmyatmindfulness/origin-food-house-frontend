/**
 * Kitchen ticket HTML template generator.
 * Generates printable HTML for kitchen display with large, readable fonts.
 */

import type {
  OrderResponseDto,
  OrderItemResponseDto,
} from '@repo/api/generated/types';
import { KITCHEN_TICKET_STYLES } from './styles';
import {
  escapeHtml,
  formatReceiptTime,
  formatOrderNumber,
  formatOrderType,
} from './utils';

/**
 * Extended order item type that may include menuItemName from the API.
 * The API may return menuItemName as an additional field in some responses.
 */
interface ExtendedOrderItem extends OrderItemResponseDto {
  menuItemName?: string;
}

/**
 * Generates the kitchen header section HTML.
 */
function buildKitchenHeader(): string {
  return `
    <div class="kitchen-header">
      <div class="kitchen-label">KITCHEN</div>
    </div>
  `;
}

/**
 * Generates the order info section HTML for kitchen.
 */
function buildOrderInfo(order: OrderResponseDto): string {
  const orderNum = formatOrderNumber(order.orderNumber, order.id);
  const orderTime = formatReceiptTime(order.createdAt);
  const orderTypeDisplay = formatOrderType(order.orderType);

  return `
    <div class="order-number">#${escapeHtml(orderNum)}</div>
    <div class="order-time">${escapeHtml(orderTime)}</div>
    ${
      orderTypeDisplay
        ? `
      <div class="order-type-container">
        <span class="order-type-badge">${escapeHtml(orderTypeDisplay)}</span>
      </div>
    `
        : ''
    }
    ${
      order.tableName
        ? `
      <div class="table-info">${escapeHtml(order.tableName)}</div>
    `
        : ''
    }
  `;
}

/**
 * Get item display name from order item.
 * Handles both standard OrderItemResponseDto and extended items with menuItemName.
 */
function getItemDisplayName(item: OrderItemResponseDto): string {
  const extendedItem = item as ExtendedOrderItem;
  return extendedItem.menuItemName ?? `Item #${item.menuItemId ?? 'Unknown'}`;
}

/**
 * Generates the items section HTML for kitchen.
 */
function buildItemsSection(order: OrderResponseDto): string {
  if (!order.orderItems || order.orderItems.length === 0) {
    return '<div class="items-section"><em>No items</em></div>';
  }

  const itemRows = order.orderItems.map((item) => {
    const itemName = getItemDisplayName(item);
    return `
      <div class="item-row">
        <div class="item-main">
          <span class="item-qty">${item.quantity}</span>
          <span class="item-name">${escapeHtml(itemName)}</span>
        </div>
        ${
          item.notes
            ? `
          <div class="item-notes">
            ${escapeHtml(item.notes)}
          </div>
        `
            : ''
        }
      </div>
    `;
  });

  return `
    <hr class="separator" />
    <div class="items-section">
      ${itemRows.join('')}
    </div>
  `;
}

/**
 * Extended order type that may include notes field.
 */
interface ExtendedOrder extends OrderResponseDto {
  notes?: string | null;
}

/**
 * Generates the order notes section HTML (if any).
 * This handles order-level notes/special instructions.
 */
function buildOrderNotesSection(order: OrderResponseDto): string {
  // Check for order-level notes (if the API provides them)
  const extendedOrder = order as ExtendedOrder;
  const orderNotes = extendedOrder.notes;

  if (!orderNotes) {
    return '';
  }

  return `
    <div class="order-notes">
      <div class="notes-label">SPECIAL INSTRUCTIONS:</div>
      <div class="notes-text">${escapeHtml(orderNotes)}</div>
    </div>
  `;
}

/**
 * Generates the kitchen footer section HTML.
 */
function buildKitchenFooter(): string {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return `
    <hr class="double-separator" />
    <div class="kitchen-footer">
      Printed: ${escapeHtml(timestamp)}
    </div>
  `;
}

/**
 * Builds complete kitchen ticket HTML document.
 *
 * @param order - Order response DTO from the API
 * @returns Complete HTML document string ready for printing
 *
 * @example
 * ```typescript
 * const html = buildKitchenTicketHtml(orderData);
 * // Open in new window for printing
 * const printWindow = window.open('', '_blank');
 * printWindow?.document.write(html);
 * printWindow?.print();
 * ```
 */
export function buildKitchenTicketHtml(order: OrderResponseDto): string {
  const headerSection = buildKitchenHeader();
  const orderInfoSection = buildOrderInfo(order);
  const itemsSection = buildItemsSection(order);
  const orderNotesSection = buildOrderNotesSection(order);
  const footerSection = buildKitchenFooter();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=80mm, initial-scale=1.0">
  <title>Kitchen Ticket #${escapeHtml(formatOrderNumber(order.orderNumber, order.id))}</title>
  <style>
    ${KITCHEN_TICKET_STYLES}
  </style>
</head>
<body>
  ${headerSection}
  ${orderInfoSection}
  ${itemsSection}
  ${orderNotesSection}
  ${footerSection}
</body>
</html>
  `.trim();
}
