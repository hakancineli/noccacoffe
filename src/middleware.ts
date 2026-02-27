import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');

  // Check if the path is admin route
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;

      // 1. Block Customers from Admin Area (Exception for Kitchen account API access)
      if ((userRole === 'CUSTOMER' || !userRole) && payload.email !== 'kitchen@noccacoffee.com') {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // 2. RBAC Logic
      // MANAGER or Kitchen Account: Access Everything
      if (userRole === 'MANAGER' || payload.email === 'kitchen@noccacoffee.com') {
        // Pass through
      }
      // BARISTA / WAITER / KITCHEN: Limited Access
      else if (['BARISTA', 'WAITER', 'KITCHEN'].includes(userRole)) {
        // Allowed paths for Staff
        const allowedPaths = [
          '/admin/pos',
          '/admin/profile',
          '/admin/orders',
          '/admin/waste',
          '/api/admin/orders',
          '/api/admin/products',
          '/api/admin/staff',
          '/api/admin/staff-consumption',
          '/api/admin/waste',
          '/api/admin/loyalty/check',
          '/api/admin/loyalty/stats',
          '/api/orders'
        ]; // Added loyalty APIs for POS usage

        // Exact match or starts with (for sub-routes)
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path)) || pathname === '/admin';

        if (!isAllowed) {
          if (isApiRoute) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
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
      if (isApiRoute) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if the path is kitchen route
  if (pathname.startsWith('/kitchen') || pathname.startsWith('/api/kitchen')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );
      const { payload } = await jwtVerify(token, secret);

      // Allow Kitchen, Admin, Barista and Managers
      if (
        payload.email !== 'kitchen@noccacoffee.com' &&
        payload.email !== 'admin@noccacoffee.com' &&
        payload.role !== 'MANAGER' &&
        payload.role !== 'BARISTA' &&
        payload.role !== 'KITCHEN'
      ) {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/kitchen/:path*', '/api/kitchen/:path*'],
};