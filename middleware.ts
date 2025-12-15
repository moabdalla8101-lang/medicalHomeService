import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  // Skip middleware for API routes, admin, provider, medical-centre routes, and static files
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

  // All customer-facing routes are now Arabic-only, no locale prefix needed
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
