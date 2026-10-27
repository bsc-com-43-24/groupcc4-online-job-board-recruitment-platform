import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const SEEKER_ROUTES = ['/seeker', '/job-seeker'];
const EMPLOYER_ROUTES = ['/employer'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    const destination = role === 'EMPLOYER' ? '/employer/jobs' : '/job-seeker/home';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (role === 'EMPLOYER' && SEEKER_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/employer/jobs', request.url));
  }

  if (role === 'SEEKER' && EMPLOYER_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/job-seeker/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};