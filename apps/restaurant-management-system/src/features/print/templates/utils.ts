/**
 * Utility functions for receipt and ticket HTML template generation.
 * All user-facing content MUST be escaped to prevent XSS attacks.
 */

/**
 * HTML escape function to prevent XSS attacks.
 * Escapes special HTML characters in user content.
 *
 * @param text - The text to escape (handles null/undefined)
 * @returns Escaped HTML-safe string
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format currency value for receipt display.
 * Converts string/number to formatted currency string.
 *
 * @param value - The value to format (string, number, null, or undefined)
 * @param currency - Currency code (defaults to THB)
 * @param locale - Locale for formatting (defaults to th-TH)
 * @returns Formatted currency string or empty string if invalid
 */
export function formatReceiptCurrency(
  value: string | number | null | undefined,
  currency = 'THB',
  locale = 'th-TH'
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numericValue == null || isNaN(numericValue)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(numericValue);
  } catch {
    // Fallback if Intl fails
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}

/**
 * Format date for receipt display.
 * Example output: "Dec 2, 2024 10:30 AM"
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale for formatting (defaults to en-US for readability)
 * @returns Formatted date string
 */
export function formatReceiptDate(
  dateString: string,
  locale = 'en-US'
): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

/**
 * Format time only for display (useful for kitchen tickets).
 * Example output: "10:30 AM"
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale for formatting (defaults to en-US)
 * @returns Formatted time string
 */
export function formatReceiptTime(
  dateString: string,
  locale = 'en-US'
): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/**
 * Format order number for display.
 * If orderNumber is not available, uses first 8 characters of ID.
 *
 * @param orderNumber - The order number string
 * @param orderId - Fallback order ID
 * @returns Formatted order number
 */
export function formatOrderNumber(
  orderNumber: string | null | undefined,
  orderId: string
): string {
  if (orderNumber) {
    return orderNumber;
  }
  return orderId.substring(0, 8).toUpperCase();
}

/**
 * Format payment method for display.
 *
 * @param method - Payment method enum value
 * @returns Human-readable payment method name
 */
export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return 'Other';

  const methodMap: Record<string, string> = {
    CASH: 'Cash',
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    MOBILE_PAYMENT: 'Mobile Payment',
    OTHER: 'Other',
  };

  return methodMap[method] ?? method;
}

/**
 * Format order type for kitchen display.
 *
 * @param orderType - Order type enum value
 * @returns Human-readable order type
 */
export function formatOrderType(orderType: string | null | undefined): string {
  if (!orderType) return '';

  const typeMap: Record<string, string> = {
    DINE_IN: 'DINE-IN',
    TAKEAWAY: 'TAKEAWAY',
    DELIVERY: 'DELIVERY',
  };

  return typeMap[orderType] ?? orderType;
}

/**
 * Format session type for display.
 *
 * @param sessionType - Session type value
 * @returns Human-readable session type
 */
export function formatSessionType(
  sessionType: string | null | undefined
): string {
  if (!sessionType) return '';

  const typeMap: Record<string, string> = {
    TABLE: 'Table',
    COUNTER: 'Counter',
    PHONE: 'Phone Order',
    TAKEOUT: 'Takeout',
  };

  return typeMap[sessionType] ?? sessionType;
}
