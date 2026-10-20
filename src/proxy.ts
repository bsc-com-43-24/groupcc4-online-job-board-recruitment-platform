import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const SEEKER_ROUTES = ['/seeker'];
const EMPLOYER_ROUTES = ['/employer'];

// ✅ Renamed function export from `middleware` to `proxy`
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  // 1. Unauthenticated users redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users attempting to visit auth pages redirect to their landing page
  if (token && (pathname === '/login' || pathname === '/register')) {
    const destination = role === 'EMPLOYER' ? '/employer/jobs' : '/seeker/jobs/job-101';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. Role-based cross-access protection
  if (role === 'EMPLOYER' && SEEKER_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/employer/jobs', request.url));
  }

  if (role === 'SEEKER' && EMPLOYER_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/seeker/jobs/job-101', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};