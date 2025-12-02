/**
 * Client-side message loading for SSG/static export.
 * Uses dynamic imports to load messages on demand with caching.
 * Supports preloading all messages for offline use.
 */
import type { Locale } from './config';

type Messages = Record<string, unknown>;

/**
 * Helper to merge multiple JSON modules into a single messages object.
 */
async function loadAndMerge(
  importFns: Array<() => Promise<{ default: Record<string, unknown> }>>
): Promise<Messages> {
  const modules = await Promise.all(importFns.map((fn) => fn()));
  return Object.assign({}, ...modules.map((m) => m.default));
}

/**
 * Message loaders for each locale.
 * Uses dynamic imports for code splitting - only loads requested locale.
 */
const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  en: () =>
    loadAndMerge([
      () => import('../../messages/en/common.json'),
      () => import('../../messages/en/auth.json'),
      () => import('../../messages/en/menu.json'),
      () => import('../../messages/en/navigation.json'),
      () => import('../../messages/en/tables.json'),
      () => import('../../messages/en/store.json'),
      () => import('../../messages/en/kitchen.json'),
      () => import('../../messages/en/orders.json'),
      () => import('../../messages/en/payments.json'),
      () => import('../../messages/en/reports.json'),
      () => import('../../messages/en/personnel.json'),
      () => import('../../messages/en/auditLogs.json'),
      () => import('../../messages/en/landing.json'),
      () => import('../../messages/en/tierUsage.json'),
      () => import('../../messages/en/admin.json'),
      () => import('../../messages/en/sales.json'),
      () => import('../../messages/en/print.json'),
    ]),

  zh: () =>
    loadAndMerge([
      () => import('../../messages/zh/common.json'),
      () => import('../../messages/zh/auth.json'),
      () => import('../../messages/zh/menu.json'),
      () => import('../../messages/zh/navigation.json'),
      () => import('../../messages/zh/tables.json'),
      () => import('../../messages/zh/store.json'),
      () => import('../../messages/zh/kitchen.json'),
      () => import('../../messages/zh/orders.json'),
      () => import('../../messages/zh/payments.json'),
      () => import('../../messages/zh/reports.json'),
      () => import('../../messages/zh/personnel.json'),
      () => import('../../messages/zh/auditLogs.json'),
      () => import('../../messages/zh/landing.json'),
      () => import('../../messages/zh/tierUsage.json'),
      () => import('../../messages/zh/admin.json'),
      () => import('../../messages/zh/sales.json'),
      () => import('../../messages/zh/print.json'),
    ]),

  my: () =>
    loadAndMerge([
      () => import('../../messages/my/common.json'),
      () => import('../../messages/my/auth.json'),
      () => import('../../messages/my/menu.json'),
      () => import('../../messages/my/navigation.json'),
      () => import('../../messages/my/tables.json'),
      () => import('../../messages/my/store.json'),
      () => import('../../messages/my/kitchen.json'),
      () => import('../../messages/my/orders.json'),
      () => import('../../messages/my/payments.json'),
      () => import('../../messages/my/reports.json'),
      () => import('../../messages/my/personnel.json'),
      () => import('../../messages/my/auditLogs.json'),
      () => import('../../messages/my/landing.json'),
      () => import('../../messages/my/tierUsage.json'),
      () => import('../../messages/my/admin.json'),
      () => import('../../messages/my/sales.json'),
      () => import('../../messages/my/print.json'),
    ]),

  th: () =>
    loadAndMerge([
      () => import('../../messages/th/common.json'),
      () => import('../../messages/th/auth.json'),
      () => import('../../messages/th/menu.json'),
      () => import('../../messages/th/navigation.json'),
      () => import('../../messages/th/tables.json'),
      () => import('../../messages/th/store.json'),
      () => import('../../messages/th/kitchen.json'),
      () => import('../../messages/th/orders.json'),
      () => import('../../messages/th/payments.json'),
      () => import('../../messages/th/reports.json'),
      () => import('../../messages/th/personnel.json'),
      () => import('../../messages/th/auditLogs.json'),
      () => import('../../messages/th/landing.json'),
      () => import('../../messages/th/tierUsage.json'),
      () => import('../../messages/th/admin.json'),
      () => import('../../messages/th/sales.json'),
      () => import('../../messages/th/print.json'),
    ]),
};

/**
 * In-memory cache for loaded messages.
 * Prevents re-fetching when switching back to a previously loaded locale.
 */
const messagesCache = new Map<Locale, Messages>();

/**
 * Load messages for a specific locale with caching.
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  // Return cached messages if available
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!;
  }

  // Load and cache messages
  const messages = await messageLoaders[locale]();
  messagesCache.set(locale, messages);

  return messages;
}

/**
 * Preload all locale messages for offline support.
 * Call this after initial render to prepare for offline use.
 */
export async function preloadAllMessages(): Promise<void> {
  const locales: Locale[] = ['en', 'zh', 'my', 'th'];

  await Promise.all(
    locales.map(async (locale) => {
      if (!messagesCache.has(locale)) {
        try {
          await loadMessages(locale);
        } catch (error) {
          console.warn(
            `Failed to preload messages for locale: ${locale}`,
            error
          );
        }
      }
    })
  );
}

/**
 * Check if messages are cached for a locale.
 */
export function isMessagesCached(locale: Locale): boolean {
  return messagesCache.has(locale);
}
