/**
 * Shared CSS styles for receipt and kitchen ticket templates.
 * These styles are embedded directly in the generated HTML for print isolation.
 */

/**
 * Base CSS styles for all receipt/ticket templates.
 * Optimized for 80mm thermal receipt printers.
 */
export const RECEIPT_BASE_STYLES = `
  @page {
    size: 80mm auto;
    margin: 0;
  }

  @media print {
    html, body {
      width: 80mm;
      margin: 0;
      padding: 0;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.4;
    width: 80mm;
    padding: 5mm;
    color: #000;
    background: #fff;
  }

  /* Typography utilities */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .text-bold { font-weight: bold; }
  .text-large { font-size: 14px; }
  .text-xlarge { font-size: 16px; }
  .text-xxlarge { font-size: 20px; }
  .text-small { font-size: 10px; }
  .uppercase { text-transform: uppercase; }

  /* Spacing utilities */
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .my-2 { margin-top: 8px; margin-bottom: 8px; }
  .my-3 { margin-top: 12px; margin-bottom: 12px; }

  /* Separators */
  .separator {
    border: none;
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .double-separator {
    border: none;
    border-top: 2px solid #000;
    margin: 8px 0;
  }

  .dotted-separator {
    border: none;
    border-top: 1px dotted #000;
    margin: 6px 0;
  }

  /* Header section */
  .receipt-header {
    text-align: center;
    margin-bottom: 12px;
  }

  .store-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .header-text {
    font-size: 11px;
    color: #333;
  }

  .logo {
    max-width: 50mm;
    max-height: 20mm;
    margin: 0 auto 8px;
    display: block;
  }

  /* Order info section */
  .order-info {
    text-align: center;
    margin-bottom: 12px;
  }

  .order-number {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .order-date {
    font-size: 11px;
    color: #444;
    margin-top: 4px;
  }

  .order-type-badge {
    display: inline-block;
    padding: 2px 8px;
    margin-top: 6px;
    border: 1px solid #000;
    font-size: 11px;
    font-weight: bold;
  }

  /* Customer info */
  .customer-info {
    margin-bottom: 12px;
    font-size: 11px;
  }

  .customer-row {
    display: flex;
    gap: 4px;
  }

  .customer-label {
    color: #666;
  }

  /* Items table */
  .items-table {
    width: 100%;
    margin-bottom: 12px;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .item-name {
    flex: 1;
    word-wrap: break-word;
    padding-right: 8px;
  }

  .item-qty {
    margin-left: 4px;
    color: #666;
  }

  .item-price {
    text-align: right;
    white-space: nowrap;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .item-notes {
    font-size: 10px;
    color: #666;
    font-style: italic;
    margin-top: 2px;
    margin-bottom: 4px;
    padding-left: 8px;
  }

  /* Totals section */
  .totals-section {
    margin-bottom: 12px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .total-label {
    color: #444;
  }

  .total-value {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .grand-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: bold;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #000;
  }

  .discount-value {
    color: #666;
  }

  /* Payment section */
  .payment-section {
    margin-bottom: 12px;
  }

  .payment-title {
    font-weight: bold;
    margin-bottom: 6px;
  }

  .payment-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
    font-size: 11px;
  }

  /* Footer section */
  .receipt-footer {
    text-align: center;
    margin-top: 12px;
  }

  .footer-text {
    font-size: 11px;
    color: #444;
    margin-bottom: 4px;
  }

  .thank-you {
    font-size: 12px;
    font-weight: bold;
    margin-top: 8px;
  }
`;

/**
 * Kitchen ticket specific styles.
 * Larger fonts and bold text for kitchen readability.
 */
export const KITCHEN_TICKET_STYLES = `
  @page {
    size: 80mm auto;
    margin: 0;
  }

  @media print {
    html, body {
      width: 80mm;
      margin: 0;
      padding: 0;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.3;
    width: 80mm;
    padding: 5mm;
    color: #000;
    background: #fff;
  }

  /* Header */
  .kitchen-header {
    text-align: center;
    padding: 8px 0;
    border: 2px solid #000;
    margin-bottom: 8px;
  }

  .kitchen-label {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 3px;
  }

  /* Order info */
  .order-number {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin: 12px 0;
    letter-spacing: 2px;
  }

  .order-time {
    font-size: 14px;
    text-align: center;
    margin-bottom: 8px;
  }

  /* Order type badge */
  .order-type-container {
    text-align: center;
    margin-bottom: 12px;
  }

  .order-type-badge {
    display: inline-block;
    padding: 6px 16px;
    border: 2px solid #000;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  /* Table name */
  .table-info {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
    padding: 6px;
    background: #000;
    color: #fff;
  }

  /* Separators */
  .separator {
    border: none;
    border-top: 2px dashed #000;
    margin: 10px 0;
  }

  .double-separator {
    border: none;
    border-top: 3px solid #000;
    margin: 10px 0;
  }

  /* Items section */
  .items-section {
    margin: 12px 0;
  }

  .item-row {
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px dotted #666;
  }

  .item-row:last-child {
    border-bottom: none;
  }

  .item-main {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .item-qty {
    font-size: 20px;
    font-weight: bold;
    min-width: 30px;
  }

  .item-qty::after {
    content: 'x';
    font-size: 14px;
    margin-left: 2px;
  }

  .item-name {
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    word-wrap: break-word;
  }

  .item-notes {
    margin-top: 4px;
    margin-left: 38px;
    font-size: 13px;
    font-style: italic;
    padding: 4px 8px;
    background: #f0f0f0;
    border-left: 3px solid #000;
  }

  /* Order notes */
  .order-notes {
    margin-top: 12px;
    padding: 8px;
    border: 2px dashed #000;
    background: #fffde7;
  }

  .notes-label {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .notes-text {
    font-size: 14px;
    font-style: italic;
  }

  /* Footer */
  .kitchen-footer {
    text-align: center;
    margin-top: 12px;
    font-size: 12px;
    color: #666;
  }
`;
