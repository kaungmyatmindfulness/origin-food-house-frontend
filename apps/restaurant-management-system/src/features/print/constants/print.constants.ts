/**
 * Constants for the Print feature.
 * Includes default values for print settings.
 */

import type { PrintSettings } from '../types/print.types';

/**
 * Default print settings.
 * These match the backend defaults in the PrintSetting Prisma model.
 */
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  // Receipt settings
  autoPrintReceipt: 'manual',
  receiptCopies: 1,
  showLogo: true,
  headerText: [],
  footerText: [],
  paperSize: '80mm',
  // Kitchen ticket settings
  autoPrintKitchenTicket: true,
  kitchenTicketCopies: 1,
  kitchenPaperSize: '80mm',
  kitchenFontSize: 'medium',
  showOrderNumber: true,
  showTableNumber: true,
  showTimestamp: true,
};
