import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

/**
 * Load and merge all translation files for a locale.
 * Translation files are split by feature domain for better maintainability.
 */
async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  // Import all feature-based translation files
  const [
    common,
    auth,
    menu,
    navigation,
    tables,
    store,
    kitchen,
    orders,
    payments,
    reports,
    personnel,
    auditLogs,
    landing,
    tierUsage,
    admin,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/menu.json`),
    import(`../../messages/${locale}/navigation.json`),
    import(`../../messages/${locale}/tables.json`),
    import(`../../messages/${locale}/store.json`),
    import(`../../messages/${locale}/kitchen.json`),
    import(`../../messages/${locale}/orders.json`),
    import(`../../messages/${locale}/payments.json`),
    import(`../../messages/${locale}/reports.json`),
    import(`../../messages/${locale}/personnel.json`),
    import(`../../messages/${locale}/auditLogs.json`),
    import(`../../messages/${locale}/landing.json`),
    import(`../../messages/${locale}/tierUsage.json`),
    import(`../../messages/${locale}/admin.json`),
  ]);

  // Merge all translation files into a single object
  return {
    ...common.default,
    ...auth.default,
    ...menu.default,
    ...navigation.default,
    ...tables.default,
    ...store.default,
    ...kitchen.default,
    ...orders.default,
    ...payments.default,
    ...reports.default,
    ...personnel.default,
    ...auditLogs.default,
    ...landing.default,
    ...tierUsage.default,
    ...admin.default,
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'; // fallback to default
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
