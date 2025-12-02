import type { PrintAdapter } from './print-adapter.interface';
import { BrowserPrintAdapter } from './browser-print-adapter';
import { TauriPrintAdapter } from './tauri-print-adapter';

/**
 * Cached adapter instance.
 * We cache the adapter to avoid creating new instances on every call.
 */
let cachedAdapter: PrintAdapter | null = null;

/**
 * Get the appropriate print adapter for the current environment.
 *
 * Returns TauriPrintAdapter when running inside a Tauri desktop app,
 * otherwise returns BrowserPrintAdapter for standard browser environments.
 *
 * The adapter is cached after first call for efficiency.
 */
export function getPrintAdapter(): PrintAdapter {
  if (cachedAdapter !== null) {
    return cachedAdapter;
  }

  // Check if running in Tauri environment
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    cachedAdapter = new TauriPrintAdapter();
  } else {
    cachedAdapter = new BrowserPrintAdapter();
  }

  return cachedAdapter;
}

/**
 * Reset the cached adapter.
 * Useful for testing or when environment changes.
 */
export function resetPrintAdapter(): void {
  cachedAdapter = null;
}
