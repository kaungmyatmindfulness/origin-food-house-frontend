/**
 * Query key factory for print-related queries.
 * Centralizes all print query keys to prevent typos and ensure consistency.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const printKeys = {
  all: ['print'] as const,

  settings: (storeId: string) =>
    [...printKeys.all, 'settings', { storeId }] as const,

  printers: () => [...printKeys.all, 'printers'] as const,

  printerStatus: (printerId: string) =>
    [...printKeys.printers(), 'status', { printerId }] as const,
};
