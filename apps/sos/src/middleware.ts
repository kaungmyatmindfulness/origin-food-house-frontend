import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Never use locale prefix in URLs (cleaner for customer ordering)
  localePrefix: 'never',

  // Detect locale from cookie or accept-language header
  localeDetection: true,
});

export const config = {
  // Match all pathnames except Next.js internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
