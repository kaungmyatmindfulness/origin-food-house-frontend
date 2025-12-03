import { useCallback, useEffect, useRef } from 'react';

import type { PaperSize } from '../types';

// ============================================================================
// Constants
// ============================================================================

/** Delay before triggering print to ensure iframe content is rendered */
const PRINT_DELAY_MS = 100;

/** Fallback cleanup timeout if onafterprint doesn't fire (1 minute) */
const CLEANUP_TIMEOUT_MS = 60_000;

/**
 * Default selectors for elements to remove from print output.
 * These are UI elements that shouldn't appear in the printed receipt/ticket.
 */
const DEFAULT_REMOVE_SELECTORS = [
  'h3', // Preview section title
  '.text-muted-foreground.mt-2', // Paper size indicator text
] as const;

/** Default paper size for thermal receipt printers */
const DEFAULT_PAPER_SIZE: PaperSize = '80mm';

// ============================================================================
// Print Styles Generator
// ============================================================================

/**
 * Generate CSS styles for preview printing based on paper size.
 * Includes Tailwind utility classes used in preview components.
 *
 * @param paperWidth - Paper width (e.g., '58mm', '80mm')
 */
function generatePrintStyles(paperWidth: string): string {
  // Adjust padding based on paper size (smaller paper = smaller padding)
  const padding = paperWidth === '58mm' ? '3mm' : '5mm';

  return `
    /* Override page settings for centered printing */
    @page {
      size: ${paperWidth} auto;
      margin: 0;
    }

    @media print {
      html {
        margin: 0;
        padding: 0;
      }

      body {
        margin: 0 auto;
        padding: ${padding};
        width: ${paperWidth};
        min-height: auto;
      }
    }

    /* Base reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: ${paperWidth};
      margin: 0 auto;
      padding: 0;
      background: #fff;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: ${paperWidth === '58mm' ? '10px' : '12px'};
      line-height: 1.4;
      padding: ${padding};
      color: #000;
    }

    /* Tailwind utility classes used in preview components */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    .space-y-1 > * + * { margin-top: ${paperWidth === '58mm' ? '3px' : '4px'}; }
    .space-y-3 > * + * { margin-top: ${paperWidth === '58mm' ? '8px' : '12px'}; }

    .bg-muted { background-color: #f4f4f5; }
    .bg-white { background-color: white; }
    .bg-black { background-color: black; }
    .text-white { color: white; }
    .text-muted-foreground { color: #71717a; }

    .font-bold { font-weight: bold; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .text-center { text-align: center; }

    .text-xs { font-size: ${paperWidth === '58mm' ? '8px' : '10px'}; }
    .text-sm { font-size: ${paperWidth === '58mm' ? '10px' : '12px'}; }
    .text-base { font-size: ${paperWidth === '58mm' ? '12px' : '14px'}; }
    .text-lg { font-size: ${paperWidth === '58mm' ? '14px' : '16px'}; }

    .p-4 { padding: ${paperWidth === '58mm' ? '12px' : '16px'}; }
    .px-2 { padding-left: ${paperWidth === '58mm' ? '6px' : '8px'}; padding-right: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    /* Escaped dot in class name: Tailwind's .py-0.5 becomes .py-0\.5 in CSS selectors */
    .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
    .py-1 { padding-top: ${paperWidth === '58mm' ? '3px' : '4px'}; padding-bottom: ${paperWidth === '58mm' ? '3px' : '4px'}; }
    .pl-2 { padding-left: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    .mb-2 { margin-bottom: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    .mb-3 { margin-bottom: ${paperWidth === '58mm' ? '8px' : '12px'}; }
    .mt-2 { margin-top: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    .mt-3 { margin-top: ${paperWidth === '58mm' ? '8px' : '12px'}; }
    .my-2 { margin-top: ${paperWidth === '58mm' ? '6px' : '8px'}; margin-bottom: ${paperWidth === '58mm' ? '6px' : '8px'}; }
    .my-3 { margin-top: ${paperWidth === '58mm' ? '8px' : '12px'}; margin-bottom: ${paperWidth === '58mm' ? '8px' : '12px'}; }

    .border { border: 1px solid #e4e4e7; }
    .border-l-4 { border-left: ${paperWidth === '58mm' ? '3px' : '4px'} solid black; }
    .rounded { border-radius: 4px; }

    .w-24 { width: ${paperWidth === '58mm' ? '72px' : '96px'}; }
    .w-48 { width: ${paperWidth === '58mm' ? '144px' : '192px'}; }
    .w-64 { width: ${paperWidth === '58mm' ? '192px' : '256px'}; }
    .h-12 { height: ${paperWidth === '58mm' ? '36px' : '48px'}; }

    hr, [data-radix-separator], [role="separator"] {
      border: none;
      border-top: 1px dashed #000;
      margin: ${paperWidth === '58mm' ? '6px' : '8px'} 0;
      height: 0;
    }
  `;
}

// ============================================================================
// Types
// ============================================================================

interface PrintPreviewOptions {
  /** Elements to remove from print output by selector */
  removeSelectors?: string[];
  /** Paper size for printing (defaults to '80mm') */
  paperSize?: PaperSize;
  /** Callback fired when print fails */
  onError?: (error: unknown) => void;
}

interface PrintPreviewResult {
  /** Function to trigger printing of preview content */
  printPreview: (
    previewRef: React.RefObject<HTMLDivElement | null>,
    options?: PrintPreviewOptions
  ) => boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for printing preview content using hidden iframe approach.
 * This mirrors the BrowserPrintAdapter pattern for consistent print behavior.
 *
 * Features:
 * - Automatic cleanup on component unmount (prevents memory leaks)
 * - Paper size-aware CSS generation
 * - Error callback for handling print failures
 * - Returns success/failure boolean for conditional logic
 *
 * @example
 * ```tsx
 * const { printPreview } = usePrintPreview();
 * const previewRef = useRef<HTMLDivElement>(null);
 *
 * // Print with default 80mm paper
 * <Button onClick={() => printPreview(previewRef)}>Print</Button>
 *
 * // Print with custom paper size and error handling
 * <Button onClick={() => {
 *   const success = printPreview(previewRef, {
 *     paperSize: '58mm',
 *     onError: (error) => toast.error('Print failed')
 *   });
 *   if (!success) {
 *     toast.warning('Preview not ready');
 *   }
 * }}>
 *   Print 58mm
 * </Button>
 *
 * <div ref={previewRef}>
 *   <ReceiptPreview settings={settings} />
 * </div>
 * ```
 */
export function usePrintPreview(): PrintPreviewResult {
  // Track iframe reference for cleanup on unmount
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Cleanup iframe on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (iframeRef.current?.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    };
  }, []);

  const printPreview = useCallback(
    (
      previewRef: React.RefObject<HTMLDivElement | null>,
      options: PrintPreviewOptions = {}
    ): boolean => {
      const previewElement = previewRef.current;

      if (!previewElement) {
        console.warn(
          '[usePrintPreview] Preview element not found. Ensure the ref is attached to a mounted element.'
        );
        return false;
      }

      const {
        removeSelectors = DEFAULT_REMOVE_SELECTORS as unknown as string[],
        paperSize = DEFAULT_PAPER_SIZE,
        onError,
      } = options;

      // Clone the preview content
      const clonedContent = previewElement.cloneNode(true) as HTMLElement;

      // Remove non-essential elements (title, paper size indicator, etc.)
      removeSelectors.forEach((selector) => {
        clonedContent.querySelectorAll(selector).forEach((el) => el.remove());
      });

      // Generate styles based on paper size
      const printStyles = generatePrintStyles(paperSize);

      // Clean up any existing iframe before creating a new one
      if (iframeRef.current?.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
      }

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.cssText =
        'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';

      // Store reference for cleanup
      iframeRef.current = iframe;

      const cleanup = () => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        if (iframeRef.current === iframe) {
          iframeRef.current = null;
        }
      };

      // Use srcdoc attribute instead of deprecated document.write()
      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=${paperSize}, initial-scale=1">
            <title>Print Preview</title>
            <style>${printStyles}</style>
          </head>
          <body>${clonedContent.innerHTML}</body>
        </html>
      `;

      iframe.onload = () => {
        try {
          const iframeWindow = iframe.contentWindow;

          if (!iframeWindow) {
            console.warn('[usePrintPreview] Could not access iframe window');
            cleanup();
            return;
          }

          // Set up cleanup after print
          iframeWindow.onafterprint = cleanup;

          // Small delay to ensure content is rendered before printing
          setTimeout(() => {
            iframeWindow.focus();
            iframeWindow.print();

            // Fallback cleanup after timeout (in case onafterprint doesn't fire)
            setTimeout(cleanup, CLEANUP_TIMEOUT_MS);
          }, PRINT_DELAY_MS);
        } catch (error) {
          console.error('[usePrintPreview] Print error:', error);
          onError?.(error);
          cleanup();
        }
      };

      iframe.onerror = (event) => {
        console.error('[usePrintPreview] Iframe load error:', event);
        onError?.(event);
        cleanup();
      };

      document.body.appendChild(iframe);
      return true;
    },
    []
  );

  return { printPreview };
}
