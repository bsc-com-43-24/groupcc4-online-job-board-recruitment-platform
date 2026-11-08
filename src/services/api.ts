import type { Role } from '@/mock/types';
import { clearSession } from '@/services/session';

/**
 * Real-backend seam.
 *
 * The project scope is frontend-only, so this module is inert unless
 * `NEXT_PUBLIC_API_URL` is set at build time. When the backend exists, point
 * the variable at it and the auth service starts using these calls - no screen
 * has to change.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

export const apiConfigured = Boolean(BASE_URL);

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly kind: 'network' | 'http',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface ApiAuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: ApiAuthUser;
}

export interface ApiLoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

export interface ApiActionResponse {
  success: boolean;
  message?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const token =
    typeof window !== 'undefined' && path !== '/auth/login'
      ? window.localStorage.getItem('token')
      : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(
      'Could not reach the server. Check your connection and try again.',
      'network',
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && token) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      clearSession();
      window.location.replace(
        `/login?session=expired&next=${encodeURIComponent(currentPath)}`,
      );
      throw new ApiRequestError('Your session has expired. Please log in again.', 'http', 401);
    }

    if (response.status === 401) {
      throw new ApiRequestError(
        path === '/auth/login'
          ? 'The email or password was incorrect.'
          : 'Your request could not be authorized. Please log in and try again.',
        'http',
        401,
      );
    }

    if (response.status >= 500) {
      throw new ApiRequestError(
        'The server is temporarily unavailable. Please try again.',
        'http',
        response.status,
      );
    }

    throw new ApiRequestError(
      payload?.message ?? 'The request could not be completed. Please try again.',
      'http',
      response.status,
    );
  }

  if (!payload) {
    throw new ApiRequestError(
      'The server returned an invalid response. Please try again.',
      'http',
      response.status,
    );
  }

  return payload;
}

export function loginRequest(input: {
  email: string;
  password: string;
}): Promise<ApiLoginResponse> {
  return post<ApiLoginResponse>('/auth/login', input);
}

export function registerRequest(input: {
  email: string;
  password: string;
  role: Role;
  name: string;
  companyName?: string;
}): Promise<ApiAuthResponse> {
  return post<ApiAuthResponse>('/auth/register', input);
}

export function requestPasswordResetRequest(email: string): Promise<ApiActionResponse> {
  return post<ApiActionResponse>('/auth/forgot-password', { email });
}

export function resetPasswordRequest(input: {
  token: string;
  password: string;
}): Promise<ApiActionResponse> {
  return post<ApiActionResponse>('/auth/reset-password', input);
}
