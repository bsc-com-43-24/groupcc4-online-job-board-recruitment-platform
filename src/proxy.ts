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

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIX.some((prefix) => matchesPrefix(pathname, prefix));

  // 2. Anonymous visitors are sent to sign in and returned to where they were.
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Signed-in visitors should not see the auth screens again.
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  // 4. Cross-role navigation says why it happened instead of silently looping.
  const isPrivateSeekerRoute =
    matchesPrefix(pathname, '/seeker') &&
    !PUBLIC_PREFIX.some((prefix) => matchesPrefix(pathname, prefix));

  if (token && role === 'EMPLOYER' && isPrivateSeekerRoute) {
    return NextResponse.redirect(
      new URL('/employer/dashboard?denied=1', request.url),
    );
  }

  if (token && role === 'SEEKER' && matchesPrefix(pathname, '/employer')) {
    return NextResponse.redirect(
      new URL('/seeker/dashboard?denied=1', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
