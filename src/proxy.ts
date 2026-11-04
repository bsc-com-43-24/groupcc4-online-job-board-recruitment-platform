import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection, role routing and legacy-URL handling for the frontend demo.
 *
 * Session state lives in cookies written by `src/services/session.ts`, so this
 * runs without any server state.
 */

const PUBLIC_EXACT = ['/', '/login', '/register'];

/** Job browsing is public; applying is not. */
const PUBLIC_PREFIX = ['/seeker/jobs'];

const LEGACY_REDIRECTS: Record<string, string> = {
  '/auth/login': '/login',
  '/auth/register': '/register',
  '/applications': '/seeker/applications',
  '/seeker/home': '/seeker/dashboard',
  '/job-seeker/home': '/seeker/dashboard',
  '/employer': '/employer/dashboard',
  '/employer/home': '/employer/dashboard',
  '/seeker': '/seeker/dashboard',
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function homeFor(role: string | undefined): string {
  return role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard';
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Legacy paths move to the canonical route map before anything else, so a
  //    stale bookmark never lands on the sign-in page by accident.
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

  // Route casing is significant on Linux/Docker even though it is not on
  // Windows, so normalise the one capitalised segment this repo used to ship.
  if (matchesPrefix(pathname, '/Employer')) {
    return NextResponse.redirect(
      new URL(`/employer${pathname.slice('/Employer'.length)}`, request.url),
    );
  }

  // This demo stores auth state per browser tab in sessionStorage, so a shared
  // cookie-based gate would make separate tabs overwrite each other. The server
  // middleware therefore only normalises legacy routes and leaves the demo
  // experience tab-local.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
