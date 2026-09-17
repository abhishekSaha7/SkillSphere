import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'skillsphere-secret-key-12345' });
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtected =
    pathname.startsWith('/student') ||
    pathname.startsWith('/instructor') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/organization') ||
    pathname.startsWith('/admin');

  const getDashboardByRole = (role: string) => {
    if (role === 'STUDENT') return '/student/dashboard';
    if (role === 'INSTRUCTOR') return '/instructor/dashboard';
    if (role === 'MENTOR') return '/mentor/dashboard';
    if (role === 'ORGANIZATION') return '/organization/dashboard';
    if (role === 'SUPER_ADMIN') return '/admin/dashboard';
    return '/student/dashboard';
  };

  // 1. Logged in user visiting auth pages (/login, /register)
  if (isAuthRoute) {
    if (token) {
      const targetDashboard = getDashboardByRole(token.role as string);
      return NextResponse.redirect(new URL(targetDashboard, req.url));
    }
    return NextResponse.next();
  }

  // 2. Protected portal routes
  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string;

    // Verify role permissions per route section
    if (pathname.startsWith('/student') && role !== 'STUDENT' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
    }
    if (pathname.startsWith('/instructor') && role !== 'INSTRUCTOR' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
    }
    if (pathname.startsWith('/mentor') && role !== 'MENTOR' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
    }
    if (pathname.startsWith('/organization') && role !== 'ORGANIZATION' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
    }
    if (pathname.startsWith('/admin') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardByRole(role), req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/instructor/:path*',
    '/mentor/:path*',
    '/organization/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
