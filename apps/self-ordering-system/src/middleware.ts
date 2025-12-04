import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh', 'my', 'th'],
  defaultLocale: 'en',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
