import type {
  PrintAdapter,
  PrintJob,
  PrintPlatform,
  PrintResult,
} from './print-adapter.interface';

/**
 * Tauri-based print adapter for native desktop printing.
 * This adapter will use Tauri's native printing capabilities when available.
 *
 * Note: This is a stub implementation. Native printing integration will be
 * implemented when the Tauri desktop app is developed.
 */
export class TauriPrintAdapter implements PrintAdapter {
  readonly platform: PrintPlatform = 'TAURI';

  /**
   * Check if Tauri printing is available.
   * Returns true only when running inside a Tauri application.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  /**
   * Execute a print job using Tauri's native printing.
   * Currently throws "Not yet implemented" error.
   *
   * Future implementation will:
   * - Use Tauri's print command to send directly to printer
   * - Support printer selection via defaultReceiptPrinter/defaultKitchenPrinter
   * - Enable silent printing without dialogs
   * - Provide better error handling and status reporting
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

    // TODO: Implement Tauri native printing
    // This will use the @tauri-apps/api package to invoke native print commands
    //
    // Example future implementation:
    // import { invoke } from '@tauri-apps/api/tauri';
    // const result = await invoke('print_receipt', {
    //   content: job.htmlContent,
    //   printer: printerName,
    // });

    return {
      success: false,
      jobId: job.id,
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Tauri native printing is not yet implemented. Use browser printing for now.',
      },
    };
  }
}
