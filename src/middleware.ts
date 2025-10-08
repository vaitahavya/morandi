import { NextResponse } from 'next/server';

// Temporarily disabled middleware to fix redirect loops
export default function middleware(req) {
  // Just pass through for now - no redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - but exclude auth API routes from middleware
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
