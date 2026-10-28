'use client';

import Cookies from 'js-cookie';
import { useSyncExternalStore } from 'react';
import { createExternalStore } from '@/lib/createExternalStore';
import type { Role } from '@/mock/types';

export const SESSION_COOKIE = 'token';
export const ROLE_COOKIE = 'user_role';
export const NAME_COOKIE = 'user_name';
export const EMAIL_COOKIE = 'user_email';
export const ID_COOKIE = 'user_id';

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'Lax' as const,
  expires: 7,
};

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
}

function readSessionFromCookies(): Session | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const role = Cookies.get(ROLE_COOKIE);
  const token = Cookies.get(SESSION_COOKIE);

  if (!token || (role !== 'SEEKER' && role !== 'EMPLOYER')) {
    return null;
  }

  return {
    userId: Cookies.get(ID_COOKIE) ?? '',
    role,
    name: Cookies.get(NAME_COOKIE) ?? 'User',
    email: Cookies.get(EMAIL_COOKIE) ?? '',
  };
}

const sessionStore = createExternalStore<Session | null>(readSessionFromCookies());

export function useSession(): Session | null {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.get,
    () => null,
  );
}

export function getSession(): Session | null {
  return sessionStore.get();
}

export function persistSession(session: Session, token = 'mock-jwt-token'): void {
  Cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
  Cookies.set(ROLE_COOKIE, session.role, COOKIE_OPTIONS);
  Cookies.set(NAME_COOKIE, session.name, COOKIE_OPTIONS);
  Cookies.set(EMAIL_COOKIE, session.email, COOKIE_OPTIONS);
  Cookies.set(ID_COOKIE, session.userId, COOKIE_OPTIONS);
  sessionStore.set(session);
}

export function clearSession(): void {
  [SESSION_COOKIE, ROLE_COOKIE, NAME_COOKIE, EMAIL_COOKIE, ID_COOKIE].forEach(
    (name) => {
      Cookies.remove(name, { path: '/' });
    },
  );
  sessionStore.set(null);
}

export function roleHome(role: Role): string {
  return role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard';
}

/**
 * Only same-origin, absolute paths are accepted as a post-login destination,
 * so `?next=` cannot be used as an open redirect.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) {
    return null;
  }
  if (!next.startsWith('/') || next.startsWith('//')) {
    return null;
  }
  if (next.startsWith('/login') || next.startsWith('/register')) {
    return null;
  }
  return next;
}

export function loginHref(currentPath: string): string {
  return `/login?next=${encodeURIComponent(currentPath)}`;
}
