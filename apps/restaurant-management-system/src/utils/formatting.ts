/**
 * Formats a numeric or string value as currency.
 * Defaults to THB for Thai Baht.
 * @param value - The numeric or string value to format.
 * @param currency - The currency code (default: 'THB').
 * @param locale - The locale string (default: 'th-TH').
 * @returns The formatted currency string or an empty string if input is invalid.
 */
export const formatCurrency = (
  value: string | number | null | undefined,
  currency = 'THB',
  locale = 'th-TH'
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numericValue == null || isNaN(numericValue)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(numericValue);
  } catch (error) {
    console.error('Currency formatting error:', error);

    return `${currency} ${numericValue.toFixed(2)}`;
  }
};

/**
 * Formats the distance from now to a given date
 * @param date - The date to calculate distance from
 * @returns Human-readable time ago string (e.g., "2 mins ago")
 */
export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
