import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/auth/login': '/login',
  '/auth/register': '/register',
  '/applications': '/seeker/applications',
  '/seeker/home': '/seeker/dashboard',
  '/job-seeker/home': '/seeker/dashboard',
  '/jobseeker/home': '/seeker/dashboard',
  '/employer': '/employer/dashboard',
  '/employer/home': '/employer/dashboard',
  '/seeker': '/seeker/dashboard',
  '/admin': '/admin/dashboard',
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyDestination = LEGACY_REDIRECTS[pathname];
  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination, request.url));
  }

  if (pathname === '/jobs') {
    return NextResponse.redirect(new URL('/seeker/jobs', request.url));
  }

  if (pathname.startsWith('/jobs/')) {
    return NextResponse.redirect(
      new URL(`/seeker/jobs/${pathname.slice('/jobs/'.length)}`, request.url),
    );
  }

  if (matchesPrefix(pathname, '/Employer')) {
    return NextResponse.redirect(
      new URL(`/employer${pathname.slice('/Employer'.length)}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
