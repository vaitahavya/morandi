import { NextResponse, NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto');
  const host = req.headers.get('host') || '';
  const isLocalHost =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.endsWith('.vercel-infra.com');

  if (proto === 'http' && !isLocalHost) {
    const url = new URL(req.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

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
