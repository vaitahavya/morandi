import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { securityHeaders, corsHeaders } from '@/lib/security';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
    const isAccountPage = req.nextUrl.pathname.startsWith('/account');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect admin routes
    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protect account routes
    if (isAccountPage && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Apply security headers
    const response = NextResponse.next();
    const securedResponse = securityHeaders(req, response);
    return corsHeaders(req, securedResponse);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ['/', '/products', '/collections', '/about', '/contact', '/blog'];
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname === route || 
          req.nextUrl.pathname.startsWith('/products/') ||
          req.nextUrl.pathname.startsWith('/collections/')
        );

        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
