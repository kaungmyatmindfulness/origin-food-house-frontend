/**
 * Print templates module.
 * Provides HTML template generators for receipts and kitchen tickets.
 */

export { buildCustomerReceiptHtml } from './customer-receipt';
export { buildKitchenTicketHtml } from './kitchen-ticket';
export {
  escapeHtml,
  formatReceiptCurrency,
  formatReceiptDate,
  formatReceiptTime,
  formatOrderNumber,
  formatPaymentMethod,
  formatOrderType,
  formatSessionType,
} from './utils';
export { RECEIPT_BASE_STYLES, KITCHEN_TICKET_STYLES } from './styles';
