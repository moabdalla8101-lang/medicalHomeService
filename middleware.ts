import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  // Always use default locale for customer-facing pages
  localePrefix: 'as-needed'
});

export const config = {
  // Match only customer-facing routes (not admin/provider/medical-centre)
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|admin|provider|medical-centre|_next|_vercel|.*\\..*).*)']
};

