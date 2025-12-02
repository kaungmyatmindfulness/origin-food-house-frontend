import type {
  PrintAdapter,
  PrintJob,
  PrintPlatform,
  PrintResult,
} from './print-adapter.interface';
import { isTauri } from '@/utils/platform';

/**
 * Printer information returned from Tauri backend.
 */
export interface TauriPrinterInfo {
  /** Printer name (used for printing) */
  name: string;
  /** Whether this is the default printer */
  is_default: boolean;
  /** Printer description or driver name */
  description: string | null;
  /** Printer status (if available) */
  status: string | null;
}

/**
 * Print options for Tauri printing.
 */
export interface TauriPrintOptions {
  /** Target printer name (uses default if not specified) */
  printer?: string;
  /** Number of copies to print */
  copies?: number;
  /** Whether to print silently (no dialog) */
  silent?: boolean;
  /** Paper width in mm (default: 80mm for thermal printers) */
  paper_width?: number;
}

/**
 * Result from Tauri print command.
 */
interface TauriPrintResult {
  success: boolean;
  error: string | null;
  job_id: string | null;
}

/**
 * Get available printers from the Tauri backend.
 * Only works when running in a Tauri environment.
 *
 * @returns List of available printers, or empty array if not in Tauri or error
 */
export async function getTauriPrinters(): Promise<TauriPrinterInfo[]> {
  if (!isTauri()) {
    console.warn('[TauriPrintAdapter] Not running in Tauri environment');
    return [];
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const printers = await invoke<TauriPrinterInfo[]>('get_printers');
    return printers;
  } catch (error) {
    console.error('[TauriPrintAdapter] Failed to get printers:', error);
    return [];
  }
}

/**
 * Get the default printer from the system.
 *
 * @returns Default printer info, or null if none found
 */
export async function getDefaultTauriPrinter(): Promise<TauriPrinterInfo | null> {
  const printers = await getTauriPrinters();
  return printers.find((p) => p.is_default) ?? printers[0] ?? null;
}

/**
 * Tauri-based print adapter for native desktop printing.
 *
 * This adapter uses Tauri's native commands to:
 * - List available printers
 * - Print silently to thermal receipt printers
 * - Support printer selection
 *
 * The adapter falls back to browser printing if Tauri is not available
 * or if the print command fails.
 */
export class TauriPrintAdapter implements PrintAdapter {
  readonly platform: PrintPlatform = 'TAURI';

  /** Default printer name (can be set via settings) */
  private defaultPrinter: string | null = null;

  /** Whether to print silently (no dialog) */
  private silentMode: boolean = true;

  /** Paper width in mm (default: 80mm for thermal printers) */
  private paperWidth: number = 80;

  /**
   * Check if Tauri printing is available.
   * Returns true only when running inside a Tauri application.
   */
  isSupported(): boolean {
    return isTauri();
  }

  /**
   * Set the default printer for this adapter.
   * @param printerName - The printer name to use as default
   */
  setDefaultPrinter(printerName: string | null): void {
    this.defaultPrinter = printerName;
  }

  /**
   * Set whether to print silently (no dialog).
   * @param silent - Whether to suppress the print dialog
   */
  setSilentMode(silent: boolean): void {
    this.silentMode = silent;
  }

  /**
   * Set the paper width for thermal printers.
   * @param width - Paper width in mm (typically 58 or 80)
   */
  setPaperWidth(width: number): void {
    this.paperWidth = width;
  }

  /**
   * Get list of available printers.
   * Convenience method that wraps getTauriPrinters.
   */
  async getPrinters(): Promise<TauriPrinterInfo[]> {
    return getTauriPrinters();
  }

  /**
   * Execute a print job using Tauri's native printing.
   *
   * This method:
   * 1. Checks if Tauri is available
   * 2. Invokes the print_html command with the job's HTML content
   * 3. Returns success/failure status
   *
   * If Tauri is not available, it returns an error suggesting browser printing.
   */
  async print(job: PrintJob): Promise<PrintResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        jobId: job.id,
        error: {
          code: 'TAURI_NOT_AVAILABLE',
          message: 'Tauri runtime is not available',
        },
      };
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');

      // Build print options
      const options: TauriPrintOptions = {
        copies: 1, // Copies are handled by the queue (multiple jobs)
        silent: this.silentMode,
        paper_width: this.paperWidth,
      };

      // Use default printer if set
      if (this.defaultPrinter) {
        options.printer = this.defaultPrinter;
      }

      // Invoke the Tauri print command
      const result = await invoke<TauriPrintResult>('print_html', {
        html: job.htmlContent,
        options,
      });

      if (result.success) {
        return {
          success: true,
          jobId: job.id,
        };
      } else {
        return {
          success: false,
          jobId: job.id,
          error: {
            code: 'PRINT_FAILED',
            message: result.error ?? 'Print command failed',
          },
        };
      }
    } catch (error) {
      console.error('[TauriPrintAdapter] Print error:', error);
      return {
        success: false,
        jobId: job.id,
        error: {
          code: 'PRINT_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during printing',
        },
      };
    }
  }
}
