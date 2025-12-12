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

      // Check if user is admin (admin@noccacoffee.com)
      if (payload.email !== 'admin@noccacoffee.com') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      if (payload.userId) {
        requestHeaders.set('x-user-id', payload.userId as string);
      }
      if (payload.email) {
        requestHeaders.set('x-user-email', payload.email as string);
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};