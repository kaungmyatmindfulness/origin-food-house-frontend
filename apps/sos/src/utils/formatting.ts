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
