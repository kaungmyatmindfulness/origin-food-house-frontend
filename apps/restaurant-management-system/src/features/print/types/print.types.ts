/**
 * Types for Print feature.
 * These types are used for print job management and print adapter configuration.
 *
 * Note: These are frontend-only types for local print queue management.
 * Not derived from API types as printing is handled client-side.
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
 * Auto-print mode for receipts
 * - manual: User must explicitly trigger print
 * - auto: Automatically print when order is completed
 * - never: Never prompt for printing
 */
export type AutoPrintMode = 'manual' | 'auto' | 'never';

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
 * Print settings stored per-store
 */
export interface PrintSettings {
  /** When to auto-print customer receipts */
  autoPrintReceipt: AutoPrintMode;
  /** Whether to auto-print kitchen tickets */
  autoPrintKitchenTicket: boolean;
  /** Default printer for receipts (Tauri only) */
  defaultReceiptPrinter?: string;
  /** Default printer for kitchen tickets (Tauri only) */
  defaultKitchenPrinter?: string;
  /** Number of receipt copies to print */
  receiptCopies: number;
  /** Number of kitchen ticket copies to print */
  kitchenTicketCopies: number;
  /** Whether to show store logo on receipts */
  showLogo: boolean;
  /** Custom header lines for receipts */
  headerText: string[];
  /** Custom footer lines for receipts */
  footerText: string[];
}

/**
 * Default print settings
 */
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  autoPrintReceipt: 'manual',
  autoPrintKitchenTicket: true,
  receiptCopies: 1,
  kitchenTicketCopies: 1,
  showLogo: true,
  headerText: [],
  footerText: [],
};
