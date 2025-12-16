import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is admin route
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;

      // 1. Block Customers from Admin Area
      if (userRole === 'CUSTOMER' || !userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // 2. RBAC Logic
      // MANAGER: Access Everything
      if (userRole === 'MANAGER') {
        // Pass through
      }
      // BARISTA / WAITER / KITCHEN: Limited Access
      else if (['BARISTA', 'WAITER', 'KITCHEN'].includes(userRole)) {
        // Allowed paths for Staff
        const allowedPaths = ['/admin/pos', '/admin/profile', '/admin/orders']; // Added orders for waiter

        // Exact match or starts with (for sub-routes)
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path)) || pathname === '/admin';

        if (!isAllowed) {
          // Redirect unauthorized staff to POS
          return NextResponse.redirect(new URL('/admin/pos', request.url));
        }
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      if (payload.userId) {
        requestHeaders.set('x-user-id', payload.userId as string);
      }
      if (payload.email) {
        requestHeaders.set('x-user-email', payload.email as string);
      }
      if (payload.role) {
        requestHeaders.set('x-user-role', payload.role as string);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if the path is kitchen route
  if (pathname.startsWith('/kitchen')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );
      const { payload } = await jwtVerify(token, secret);

      // Allow Kitchen and Admin
      if (payload.email !== 'kitchen@noccacoffee.com' && payload.email !== 'admin@noccacoffee.com') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/kitchen/:path*'],
};