/**
 * Customer receipt HTML template generator.
 * Generates printable HTML for 80mm thermal receipt printers.
 */

import type { ReceiptOrderData } from '@/features/sales/utils/transform-order-to-receipt';
import type { PrintSettings } from '../types/print.types';
import { RECEIPT_BASE_STYLES } from './styles';
import {
  escapeHtml,
  formatReceiptCurrency,
  formatReceiptDate,
  formatOrderNumber,
  formatPaymentMethod,
  formatSessionType,
} from './utils';

/**
 * Generates the header section HTML.
 */
function buildHeaderSection(
  settings: PrintSettings,
  storeName?: string
): string {
  const headerLines: string[] = [];

  // Store logo
  if (settings.showLogo && storeName) {
    headerLines.push(`<div class="store-name">${escapeHtml(storeName)}</div>`);
  }

  // Custom header text lines
  if (settings.headerText && settings.headerText.length > 0) {
    settings.headerText.forEach((line) => {
      if (line.trim()) {
        headerLines.push(`<div class="header-text">${escapeHtml(line)}</div>`);
      }
    });
  }

  if (headerLines.length === 0) {
    return '';
  }

  return `
    <div class="receipt-header">
      ${headerLines.join('\n      ')}
    </div>
    <hr class="separator" />
  `;
}

/**
 * Generates the order info section HTML.
 */
function buildOrderInfoSection(order: ReceiptOrderData): string {
  const orderNum = formatOrderNumber(order.orderNumber, order.id);
  const orderDate = formatReceiptDate(order.createdAt);

  // Session/table info
  const sessionType = order.session?.sessionType;
  const tableName = order.tableName;
  const sessionDisplay = sessionType
    ? formatSessionType(sessionType)
    : tableName
      ? escapeHtml(tableName)
      : null;

  return `
    <div class="order-info">
      <div class="order-number">#${escapeHtml(orderNum)}</div>
      <div class="order-date">${escapeHtml(orderDate)}</div>
      ${
        sessionDisplay
          ? `<div class="order-type-badge">${sessionDisplay}</div>`
          : ''
      }
    </div>
  `;
}

/**
 * Generates the customer info section HTML.
 */
function buildCustomerInfoSection(order: ReceiptOrderData): string {
  const customerName = order.session?.customerName;
  const customerPhone = order.session?.customerPhone;

  if (!customerName && !customerPhone) {
    return '';
  }

  return `
    <div class="customer-info">
      ${
        customerName
          ? `
        <div class="customer-row">
          <span class="customer-label">Customer:</span>
          <span>${escapeHtml(customerName)}</span>
        </div>
      `
          : ''
      }
      ${
        customerPhone
          ? `
        <div class="customer-row">
          <span class="customer-label">Phone:</span>
          <span>${escapeHtml(customerPhone)}</span>
        </div>
      `
          : ''
      }
    </div>
    <hr class="dotted-separator" />
  `;
}

/**
 * Generates the items table section HTML.
 */
function buildItemsSection(order: ReceiptOrderData): string {
  if (!order.orderItems || order.orderItems.length === 0) {
    return '<div class="items-table"><em>No items</em></div>';
  }

  const itemRows = order.orderItems.map((item) => {
    const itemPrice =
      Number(item.finalPrice || item.price) * (item.quantity || 1);
    const formattedPrice = formatReceiptCurrency(itemPrice);

    return `
      <div class="item-row">
        <div class="item-name">
          ${escapeHtml(item.menuItemName)}
          <span class="item-qty">x${item.quantity}</span>
        </div>
        <div class="item-price">${escapeHtml(formattedPrice)}</div>
      </div>
      ${
        item.notes
          ? `<div class="item-notes">${escapeHtml(item.notes)}</div>`
          : ''
      }
    `;
  });

  return `
    <div class="items-table">
      ${itemRows.join('')}
    </div>
  `;
}

/**
 * Generates the totals section HTML.
 */
function buildTotalsSection(order: ReceiptOrderData): string {
  const rows: string[] = [];

  // Subtotal
  rows.push(`
    <div class="total-row">
      <span class="total-label">Subtotal</span>
      <span class="total-value">${escapeHtml(formatReceiptCurrency(order.subTotal))}</span>
    </div>
  `);

  // Tax (if present)
  if (order.taxAmount && Number(order.taxAmount) > 0) {
    rows.push(`
      <div class="total-row">
        <span class="total-label">Tax</span>
        <span class="total-value">${escapeHtml(formatReceiptCurrency(order.taxAmount))}</span>
      </div>
    `);
  }

  // VAT (if present)
  if (order.vatAmount && Number(order.vatAmount) > 0) {
    rows.push(`
      <div class="total-row">
        <span class="total-label">VAT</span>
        <span class="total-value">${escapeHtml(formatReceiptCurrency(order.vatAmount))}</span>
      </div>
    `);
  }

  // Service Charge (if present)
  if (order.serviceChargeAmount && Number(order.serviceChargeAmount) > 0) {
    rows.push(`
      <div class="total-row">
        <span class="total-label">Service Charge</span>
        <span class="total-value">${escapeHtml(formatReceiptCurrency(order.serviceChargeAmount))}</span>
      </div>
    `);
  }

  // Discount (if present)
  if (order.discountAmount && Number(order.discountAmount) > 0) {
    rows.push(`
      <div class="total-row">
        <span class="total-label">Discount</span>
        <span class="total-value discount-value">-${escapeHtml(formatReceiptCurrency(order.discountAmount))}</span>
      </div>
    `);
  }

  // Grand Total
  rows.push(`
    <div class="grand-total-row">
      <span>TOTAL</span>
      <span>${escapeHtml(formatReceiptCurrency(order.grandTotal))}</span>
    </div>
  `);

  return `
    <hr class="separator" />
    <div class="totals-section">
      ${rows.join('')}
    </div>
  `;
}

/**
 * Generates the payment details section HTML.
 */
function buildPaymentSection(order: ReceiptOrderData): string {
  if (!order.payments || order.payments.length === 0) {
    return '';
  }

  const paymentRows = order.payments.map((payment, index) => {
    const rows: string[] = [];

    // Payment method
    rows.push(`
      <div class="payment-row">
        <span>Method</span>
        <span>${escapeHtml(formatPaymentMethod(payment.paymentMethod))}</span>
      </div>
    `);

    // Amount
    rows.push(`
      <div class="payment-row">
        <span>Amount</span>
        <span>${escapeHtml(formatReceiptCurrency(payment.amount))}</span>
      </div>
    `);

    // Amount tendered (for cash payments)
    if (payment.amountTendered && Number(payment.amountTendered) > 0) {
      rows.push(`
        <div class="payment-row">
          <span>Tendered</span>
          <span>${escapeHtml(formatReceiptCurrency(payment.amountTendered))}</span>
        </div>
      `);

      // Change
      if (payment.change !== undefined && payment.change !== null) {
        rows.push(`
          <div class="payment-row">
            <span>Change</span>
            <span>${escapeHtml(formatReceiptCurrency(payment.change))}</span>
          </div>
        `);
      }
    }

    return `
      <div class="payment-details" data-payment-index="${index}">
        ${rows.join('')}
      </div>
    `;
  });

  return `
    <hr class="separator" />
    <div class="payment-section">
      <div class="payment-title">Payment Details</div>
      ${paymentRows.join('<hr class="dotted-separator" />')}
    </div>
  `;
}

/**
 * Generates the footer section HTML.
 */
function buildFooterSection(settings: PrintSettings): string {
  const footerLines: string[] = [];

  // Custom footer text lines
  if (settings.footerText && settings.footerText.length > 0) {
    settings.footerText.forEach((line) => {
      if (line.trim()) {
        footerLines.push(`<div class="footer-text">${escapeHtml(line)}</div>`);
      }
    });
  }

  // Always add thank you message
  footerLines.push('<div class="thank-you">Thank you!</div>');

  return `
    <hr class="separator" />
    <div class="receipt-footer">
      ${footerLines.join('\n      ')}
    </div>
  `;
}

/**
 * Builds complete customer receipt HTML document.
 *
 * @param order - Order data transformed for receipt display
 * @param settings - Print settings for customization
 * @param storeName - Optional store name for header
 * @returns Complete HTML document string ready for printing
 *
 * @example
 * ```typescript
 * const html = buildCustomerReceiptHtml(orderData, printSettings, 'My Restaurant');
 * // Open in new window for printing
 * const printWindow = window.open('', '_blank');
 * printWindow?.document.write(html);
 * printWindow?.print();
 * ```
 */
export function buildCustomerReceiptHtml(
  order: ReceiptOrderData,
  settings: PrintSettings,
  storeName?: string
): string {
  const headerSection = buildHeaderSection(settings, storeName);
  const orderInfoSection = buildOrderInfoSection(order);
  const customerInfoSection = buildCustomerInfoSection(order);
  const itemsSection = buildItemsSection(order);
  const totalsSection = buildTotalsSection(order);
  const paymentSection = buildPaymentSection(order);
  const footerSection = buildFooterSection(settings);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=80mm, initial-scale=1.0">
  <title>Receipt #${escapeHtml(formatOrderNumber(order.orderNumber, order.id))}</title>
  <style>
    ${RECEIPT_BASE_STYLES}
  </style>
</head>
<body>
  ${headerSection}
  ${orderInfoSection}
  ${customerInfoSection}
  ${itemsSection}
  ${totalsSection}
  ${paymentSection}
  ${footerSection}
</body>
</html>
  `.trim();
}
