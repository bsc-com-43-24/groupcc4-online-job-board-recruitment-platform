import type { Role } from '@/mock/types';

/**
 * Real-backend seam.
 *
 * The project scope is frontend-only, so this module is inert unless
 * `NEXT_PUBLIC_API_URL` is set at build time. When the backend exists, point
 * the variable at it and the auth service starts using these calls - no screen
 * has to change.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiConfigured = Boolean(BASE_URL);

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

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }

  if (!payload) {
    throw new Error('The server returned an empty response.');
  }

  return payload;
}

export function loginRequest(input: {
  email: string;
  password: string;
  role: Role;
}): Promise<ApiAuthResponse> {
  return post<ApiAuthResponse>('/auth/login', input);
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
