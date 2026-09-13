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

  if (isAuthRoute) {
    if (token) {
      const role = token.role as string;
      if (role === 'STUDENT') return NextResponse.redirect(new URL('/student/dashboard', req.url));
      if (role === 'INSTRUCTOR') return NextResponse.redirect(new URL('/instructor/dashboard', req.url));
      if (role === 'MENTOR') return NextResponse.redirect(new URL('/mentor/dashboard', req.url));
      if (role === 'ORGANIZATION') return NextResponse.redirect(new URL('/organization/dashboard', req.url));
      if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string;

    if (pathname.startsWith('/student') && (role as string) !== 'STUDENT' && (role as string) !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/instructor') && (role as string) !== 'INSTRUCTOR' && (role as string) !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/mentor') && (role as string) !== 'MENTOR' && (role as string) !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/organization') && (role as string) !== 'ORGANIZATION' && (role as string) !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/admin') && (role as string) !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
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
