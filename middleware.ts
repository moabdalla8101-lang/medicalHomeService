import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  // Always show locale prefix
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Skip middleware for API routes, admin, provider, medical-centre routes
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/provider') ||
    pathname.startsWith('/medical-centre') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Apply intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

