export type {
  PrintAdapter,
  PrintJob,
  PrintPlatform,
  PrintResult,
} from './print-adapter.interface';

export { BrowserPrintAdapter } from './browser-print-adapter';
export { TauriPrintAdapter } from './tauri-print-adapter';
export { getPrintAdapter, resetPrintAdapter } from './adapter-factory';
