import type {
  PrintAdapter,
  PrintJob,
  PrintPlatform,
  PrintResult,
} from './print-adapter.interface';

/**
 * Print timeout in milliseconds.
 * If print dialog is not resolved within this time, we assume it was cancelled.
 */
const PRINT_TIMEOUT_MS = 60000; // 60 seconds

/**
 * CSS styles for 80mm thermal receipt printing.
 * These styles optimize the output for standard POS thermal printers.
 */
const THERMAL_RECEIPT_STYLES = `
  @page {
    size: 80mm auto;
    margin: 0;
  }

  @media print {
    html, body {
      width: 80mm;
      margin: 0;
      padding: 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.3;
    }

    * {
      box-sizing: border-box;
    }

    /* Hide non-printable elements */
    .no-print {
      display: none !important;
    }

    /* Ensure content fits within thermal paper width */
    .receipt-container {
      width: 100%;
      max-width: 80mm;
      padding: 2mm;
    }

    /* Prevent page breaks inside important elements */
    .receipt-header,
    .receipt-footer,
    .receipt-item {
      page-break-inside: avoid;
    }

    /* Ensure text wraps properly */
    p, span, div {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Separator lines */
    .receipt-divider {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }

    /* Item rows */
    .receipt-item {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    /* Totals section */
    .receipt-total {
      font-weight: bold;
      font-size: 14px;
      margin-top: 8px;
    }
  }
`;

/**
 * Browser-based print adapter using hidden iframe and window.print().
 * This adapter works in all modern browsers and uses the native print dialog.
 */
export class BrowserPrintAdapter implements PrintAdapter {
  readonly platform: PrintPlatform = 'BROWSER';

  /**
   * Check if browser printing is supported.
   * Returns true for all browser environments.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.print === 'function';
  }

  /**
   * Execute a print job using a hidden iframe.
   * Opens the browser's native print dialog with the job's HTML content.
   */
  async print(job: PrintJob): Promise<PrintResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        jobId: job.id,
        error: {
          code: 'PRINT_NOT_SUPPORTED',
          message: 'Printing is not supported in this environment',
        },
      };
    }

    try {
      const result = await this.printWithIframe(job);
      return result;
    } catch (error) {
      return {
        success: false,
        jobId: job.id,
        error: {
          code: 'PRINT_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown print error',
        },
      };
    }
  }

  /**
   * Print using a hidden iframe approach.
   * Creates an iframe, injects content with print styles, and triggers print.
   */
  private printWithIframe(job: PrintJob): Promise<PrintResult> {
    return new Promise((resolve) => {
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';

      // Track print completion
      let printCompleted = false;
      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      const handlePrintComplete = (success: boolean) => {
        if (printCompleted) return;
        printCompleted = true;
        cleanup();

        resolve({
          success,
          jobId: job.id,
          error: success
            ? undefined
            : {
                code: 'PRINT_CANCELLED',
                message: 'Print was cancelled or timed out',
              },
        });
      };

      iframe.onload = () => {
        try {
          const iframeWindow = iframe.contentWindow;
          const iframeDoc = iframe.contentDocument;

          if (!iframeWindow || !iframeDoc) {
            handlePrintComplete(false);
            return;
          }

          // Write content with print styles
          const wrappedContent = this.wrapWithPrintStyles(job.htmlContent);
          iframeDoc.open();
          iframeDoc.write(wrappedContent);
          iframeDoc.close();

          // Set up print event handlers
          iframeWindow.onbeforeprint = () => {
            // Print dialog opened
          };

          iframeWindow.onafterprint = () => {
            // Print dialog closed (printed or cancelled)
            // We assume success here as we can't reliably detect cancellation
            handlePrintComplete(true);
          };

          // Timeout fallback in case onafterprint doesn't fire
          timeoutId = setTimeout(() => {
            handlePrintComplete(false);
          }, PRINT_TIMEOUT_MS);

          // Small delay to ensure content is rendered
          setTimeout(() => {
            iframeWindow.focus();
            iframeWindow.print();
          }, 100);
        } catch (error) {
          console.error('[BrowserPrintAdapter] Print error:', error);
          handlePrintComplete(false);
        }
      };

      // Handle iframe load error
      iframe.onerror = () => {
        handlePrintComplete(false);
      };

      // Append iframe to trigger load
      document.body.appendChild(iframe);
    });
  }

  /**
   * Wrap HTML content with print-specific styles for thermal receipt printing.
   */
  private wrapWithPrintStyles(htmlContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=80mm, initial-scale=1">
          <title>Print</title>
          <style>${THERMAL_RECEIPT_STYLES}</style>
        </head>
        <body>
          <div class="receipt-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;
  }
}
