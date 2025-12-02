/**
 * Hook for managing Tauri-specific printer functionality.
 *
 * Provides:
 * - List of available printers
 * - Default printer detection
 * - Platform detection (Tauri vs browser)
 */

import { useCallback, useEffect, useState } from 'react';

import { isTauri } from '@/utils/platform';
import {
  getTauriPrinters,
  getDefaultTauriPrinter,
} from '../adapters/tauri-print-adapter';

import type { TauriPrinterInfo } from '../adapters/tauri-print-adapter';

interface UseTauriPrintersReturn {
  /** List of available printers */
  printers: TauriPrinterInfo[];
  /** The default printer (if any) */
  defaultPrinter: TauriPrinterInfo | null;
  /** Whether the printer list is loading */
  isLoading: boolean;
  /** Error message if printer discovery failed */
  error: string | null;
  /** Whether running in Tauri environment */
  isTauriEnvironment: boolean;
  /** Refresh the printer list */
  refresh: () => Promise<void>;
}

/**
 * Hook for discovering and managing Tauri printers.
 *
 * This hook:
 * - Automatically detects if running in Tauri
 * - Fetches available printers from the OS
 * - Identifies the default printer
 * - Provides refresh functionality
 *
 * @returns Printer state and actions
 *
 * @example
 * ```tsx
 * function PrinterSelector({ onSelect }: { onSelect: (printer: string) => void }) {
 *   const { printers, defaultPrinter, isLoading, isTauriEnvironment } = useTauriPrinters();
 *
 *   if (!isTauriEnvironment) {
 *     return <p>Printer selection only available in desktop app</p>;
 *   }
 *
 *   if (isLoading) {
 *     return <Skeleton />;
 *   }
 *
 *   return (
 *     <Select onValueChange={onSelect} defaultValue={defaultPrinter?.name}>
 *       {printers.map((printer) => (
 *         <SelectItem key={printer.name} value={printer.name}>
 *           {printer.name} {printer.is_default && '(Default)'}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useTauriPrinters(): UseTauriPrintersReturn {
  const [printers, setPrinters] = useState<TauriPrinterInfo[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState<TauriPrinterInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTauriEnvironment = isTauri();

  const refresh = useCallback(async () => {
    if (!isTauriEnvironment) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [printerList, defaultP] = await Promise.all([
        getTauriPrinters(),
        getDefaultTauriPrinter(),
      ]);

      setPrinters(printerList);
      setDefaultPrinter(defaultP);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get printer list'
      );
      setPrinters([]);
      setDefaultPrinter(null);
    } finally {
      setIsLoading(false);
    }
  }, [isTauriEnvironment]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    printers,
    defaultPrinter,
    isLoading,
    error,
    isTauriEnvironment,
    refresh,
  };
}
