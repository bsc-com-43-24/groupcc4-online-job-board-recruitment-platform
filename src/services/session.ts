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

const SESSION_STORAGE_KEY = 'demo_session';

function readSessionFromStorage(): Session | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    const role = parsed.role;

    if (!role || (role !== 'SEEKER' && role !== 'EMPLOYER')) {
      return null;
    }

    return {
      userId: parsed.userId ?? '',
      role,
      name: parsed.name ?? 'User',
      email: parsed.email ?? '',
    };
  } catch {
    return null;
  }
}

const sessionStore = createExternalStore<Session | null>(readSessionFromStorage());

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
  const nextSession = {
    userId: session.userId,
    role: session.role,
    name: session.name,
    email: session.email,
  };

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }

  Cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
  Cookies.set(ROLE_COOKIE, session.role, COOKIE_OPTIONS);
  Cookies.set(NAME_COOKIE, session.name, COOKIE_OPTIONS);
  Cookies.set(EMAIL_COOKIE, session.email, COOKIE_OPTIONS);
  Cookies.set(ID_COOKIE, session.userId, COOKIE_OPTIONS);
  sessionStore.set(nextSession);
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

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
