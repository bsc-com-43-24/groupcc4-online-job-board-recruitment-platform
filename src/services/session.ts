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

const SESSION_STORAGE_KEY = 'cc4.session.v1';
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

const VALID_ROLES: Role[] = ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'];
let loginRedirectPending = false;

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && VALID_ROLES.includes(value as Role);
}

function readSessionFromStorage(): Session | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!raw || !token || token === 'mock-jwt-token') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!isRole(parsed.role) || !parsed.userId || !parsed.email) {
      return null;
    }

    return {
      userId: parsed.userId,
      role: parsed.role,
      name: parsed.name ?? parsed.email.split('@')[0],
      email: parsed.email,
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

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function persistSession(session: Session, token: string): void {
  const nextSession: Session = {
    userId: session.userId,
    role: session.role,
    name: session.name,
    email: session.email,
  };

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(ROLE_KEY, session.role);
    window.sessionStorage.removeItem('demo_session');
  }

  Cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
  Cookies.set(ROLE_COOKIE, session.role, COOKIE_OPTIONS);
  Cookies.set(NAME_COOKIE, session.name, COOKIE_OPTIONS);
  Cookies.set(EMAIL_COOKIE, session.email, COOKIE_OPTIONS);
  Cookies.set(ID_COOKIE, session.userId, COOKIE_OPTIONS);
  sessionStore.set(nextSession);
}

export function updateSessionName(name: string): void {
  const current = sessionStore.get();
  if (!current || !name || current.name === name) {
    return;
  }
  persistSession({ ...current, name }, getToken() ?? '');
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem('demo_session');
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(ROLE_KEY);
  }

  [SESSION_COOKIE, ROLE_COOKIE, NAME_COOKIE, EMAIL_COOKIE, ID_COOKIE].forEach(
    (name) => {
      Cookies.remove(name, { path: '/' });
    },
  );
  sessionStore.set(null);
}

export function beginLoginRedirect(): boolean {
  if (loginRedirectPending) {
    return false;
  }
  loginRedirectPending = true;
  return true;
}

export function isLoginRedirectPending(): boolean {
  return loginRedirectPending;
}

export function roleHome(role: Role): string {
  if (role === 'ADMIN') {
    return '/admin/dashboard';
  }
  return role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard';
}

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
