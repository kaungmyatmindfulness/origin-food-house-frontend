/**
 * Types for Print feature.
 * These types are used for print job management and print adapter configuration.
 *
 * Note: These are frontend-only types for local print queue management.
 * API types (PrintSettingsDto) are imported directly from @repo/api/generated/api.d.ts
 */

/**
 * Type of print job
 * - CUSTOMER_RECEIPT: Receipt for customer with order details and payment info
 * - KITCHEN_TICKET: Ticket for kitchen with order items and preparation notes
 */
export type PrintJobType = 'CUSTOMER_RECEIPT' | 'KITCHEN_TICKET';

/**
 * Status of a print job in the queue
 * - PENDING: Job is waiting to be processed
 * - PRINTING: Job is currently being printed
 * - COMPLETED: Job was printed successfully
 * - FAILED: Job failed to print (may be retried)
 * - CANCELLED: Job was cancelled by user
 */
export type PrintJobStatus =
  | 'PENDING'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Auto-print mode for receipts (matches backend enum)
 * - manual: User must explicitly trigger print
 * - auto: Automatically print when order is completed
 * - never: Never prompt for printing
 */
export type AutoPrintMode = 'manual' | 'auto' | 'never';

/**
 * Paper size options for thermal printers (matches backend enum)
 * - 58mm: Compact thermal paper (2.25")
 * - 80mm: Standard thermal paper (3.15")
 */
export type PaperSize = '58mm' | '80mm';

/**
 * Font size options for kitchen tickets (matches backend enum)
 * - small: More content fits, harder to read
 * - medium: Balanced readability
 * - large: Easier to read in busy kitchens
 * - xlarge: Maximum readability
 */
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Print platform/adapter type
 * - BROWSER: Uses browser's native print dialog
 * - TAURI: Uses Tauri's native printing capabilities
 */
export type PrintPlatform = 'BROWSER' | 'TAURI';

/**
 * A print job in the queue
 */
export interface PrintJob {
  /** Unique identifier for the job (UUID) */
  id: string;
  /** Type of print job */
  type: PrintJobType;
  /** Order ID this job is for */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Store ID */
  storeId: string;
  /** Current status of the job */
  status: PrintJobStatus;
  /** Pre-rendered HTML content to print */
  htmlContent: string;
  /** Number of times this job has been retried */
  retryCount: number;
  /** Maximum number of retries allowed */
  maxRetries: number;
  /** When the job was created */
  createdAt: string;
  /** When the job was last updated */
  updatedAt: string;
  /** Error message if job failed */
  errorMessage?: string;
}

/**
 * Result of a print operation
 */
export interface PrintResult {
  /** Whether the print was successful */
  success: boolean;
  /** ID of the job that was printed */
  jobId: string;
  /** Error details if print failed */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Interface for print adapters (browser, Tauri, etc.)
 */
export interface PrintAdapter {
  /** Platform this adapter is for */
  readonly platform: PrintPlatform;
  /** Execute a print job */
  print(job: PrintJob): Promise<PrintResult>;
  /** Check if this adapter is supported in the current environment */
  isSupported(): boolean;
}

/**
 * Print settings stored per-store (frontend type matching backend PrintSettingsDto)
 */
export interface PrintSettings {
  // ==================== Receipt Settings ====================
  /** When to auto-print customer receipts */
  autoPrintReceipt: AutoPrintMode;
  /** Number of receipt copies to print */
  receiptCopies: number;
  /** Whether to show store logo on receipts */
  showLogo: boolean;
  /** Custom header lines for receipts */
  headerText: string[];
  /** Custom footer lines for receipts */
  footerText: string[];
  /** Paper size for customer receipts (58mm or 80mm) */
  paperSize: PaperSize;
  /** Default printer for receipts (Tauri only) */
  defaultReceiptPrinter?: string;

  // ==================== Kitchen Ticket Settings ====================
  /** Whether to auto-print kitchen tickets */
  autoPrintKitchenTicket: boolean;
  /** Number of kitchen ticket copies to print */
  kitchenTicketCopies: number;
  /** Paper size for kitchen tickets (58mm or 80mm) */
  kitchenPaperSize: PaperSize;
  /** Font size for kitchen tickets */
  kitchenFontSize: FontSize;
  /** Whether to show order number on kitchen tickets */
  showOrderNumber: boolean;
  /** Whether to show table number on kitchen tickets */
  showTableNumber: boolean;
  /** Whether to show timestamp on kitchen tickets */
  showTimestamp: boolean;
  /** Default printer for kitchen tickets (Tauri only) */
  defaultKitchenPrinter?: string;
}
