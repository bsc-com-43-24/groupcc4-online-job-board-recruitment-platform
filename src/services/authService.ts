import type { Role } from '@/mock/types';
import {
  createAccount,
  findAccount,
  findAccountByEmail,
  updateAccountPassword,
} from '@/mock/store';
import {
  apiConfigured,
  type ApiLoginResponse,
  loginRequest,
  registerRequest,
  requestPasswordResetRequest,
  resetPasswordRequest,
  ApiRequestError,
} from './api';
import { persistSession } from './session';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
  networkError?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  name: string;
  companyName?: string;
}

const DEMO_TOKEN = 'mock-jwt-token';
const SIMULATED_LATENCY_MS = 300;
const RESET_TOKEN_PREFIX = 'cc4.jobboard.password-reset.';
const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRole(role: string | undefined): Role | null {
  switch (role?.trim().toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'employer':
      return 'EMPLOYER';
    case 'seeker':
    case 'job_seeker':
    case 'jobseeker':
      return 'SEEKER';
    default:
      return null;
  }
}

function loginUser(response: ApiLoginResponse, email: string): AuthResponse {
  if (response.success === false) {
    return { success: false, message: response.message || 'Sign in failed.' };
  }

  const role = parseRole(response.user?.role);
  if (!role) {
    return {
      success: false,
      message: response.message || 'The server returned an invalid account role.',
    };
  }
  if (!response.token) {
    return {
      success: false,
      message: response.message || 'The server did not return an authentication token.',
    };
  }

  return startSession(
    {
      id: response.user?.id ?? email,
      email: response.user?.email ?? email,
      role,
      name: response.user?.name ?? email.split('@')[0],
    },
    response.token,
  );
}

function startSession(user: AuthUser, token = DEMO_TOKEN): AuthResponse {
  persistSession(
    {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    token,
  );

  return { success: true, message: 'Signed in.', token, user };
}

interface PasswordResetRecord {
  email: string;
  expiresAt: number;
}

function createResetToken(): string {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readResetRecord(token: string): PasswordResetRecord | null {
  try {
    const raw = window.localStorage.getItem(`${RESET_TOKEN_PREFIX}${token}`);
    if (!raw) {
      return null;
    }
    const record = JSON.parse(raw) as Partial<PasswordResetRecord>;
    if (typeof record.email !== 'string' || typeof record.expiresAt !== 'number') {
      return null;
    }
    return { email: record.email, expiresAt: record.expiresAt };
  } catch {
    return null;
  }
}

function removeResetRecord(token: string): void {
  try {
    window.localStorage.removeItem(`${RESET_TOKEN_PREFIX}${token}`);
  } catch {
    // Ignore storage failures; the reset request will be rejected if no record exists.
  }
}

/**
 * Authentication against the configured backend or the demo store.
 *
 * When `NEXT_PUBLIC_API_URL` is configured the real endpoints are used
 * instead; there is no silent fallback to mock data once a backend exists, so
 * a broken backend is visible rather than disguised.
 */
export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    if (apiConfigured) {
      try {
        const response = await loginRequest({
          email: input.email,
          password: input.password,
        });
        return loginUser(response, input.email);
      } catch (error) {
        const networkError =
          error instanceof ApiRequestError && error.kind === 'network';
        return {
          success: false,
          message:
            networkError
              ? 'Could not reach the server. Check your connection and try again.'
              : error instanceof Error
              ? error.message
              : 'Could not reach the server. Please try again.',
          networkError,
        };
      }
    }

    await delay(SIMULATED_LATENCY_MS);

    const account = findAccount(input.email, input.password);

    if (!account) {
      return {
        success: false,
        message: 'Email or password is incorrect.',
      };
    }

    return startSession({
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name,
    });
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (apiConfigured) {
      try {
        const response = await registerRequest(input);
        if (!response.success || !response.user) {
          return {
            success: false,
            message: response.message || 'Registration failed.',
          };
        }
        return startSession(response.user, response.token);
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Could not reach the server. Please try again.',
        };
      }
    }

    await delay(SIMULATED_LATENCY_MS);

    if (findAccountByEmail(input.email)) {
      return {
        success: false,
        message: 'An account with that email already exists. Try signing in instead.',
      };
    }

    const account = createAccount({
      email: input.email,
      password: input.password,
      role: input.role,
      name: input.name,
      companyName: input.companyName,
    });

    return startSession({
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name,
    });
  },

  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
    resetUrl?: string;
  }> {
    if (apiConfigured) {
      try {
        const response = await requestPasswordResetRequest(email);
        return {
          success: response.success,
          message:
            response.message ?? 'If an account exists for that email, reset instructions are on the way.',
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Could not request a password reset.',
        };
      }
    }

    await delay(SIMULATED_LATENCY_MS);

    try {
      const token = createResetToken();
      window.localStorage.setItem(
        `${RESET_TOKEN_PREFIX}${token}`,
        JSON.stringify({
          email: email.trim().toLowerCase(),
          expiresAt: Date.now() + RESET_TOKEN_LIFETIME_MS,
        }),
      );
      return {
        success: true,
        message: 'If an account exists for that email, reset instructions are on the way.',
        resetUrl: `${window.location.origin}/reset-password?token=${token}`,
      };
    } catch {
      return {
        success: false,
        message: 'Could not create a reset link in this browser. Please try again.',
      };
    }
  },

  async resetPassword(input: { token: string; password: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    if (apiConfigured) {
      try {
        const response = await resetPasswordRequest(input);
        return {
          success: response.success,
          message: response.message ?? 'Your password has been reset.',
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Could not reset your password.',
        };
      }
    }

    await delay(SIMULATED_LATENCY_MS);

    const record = readResetRecord(input.token);
    if (!record || record.expiresAt <= Date.now()) {
      removeResetRecord(input.token);
      return {
        success: false,
        message: 'This reset link is invalid or expired. Request a new one to continue.',
      };
    }

    const account = findAccountByEmail(record.email);
    if (!account || !updateAccountPassword(account.id, input.password)) {
      removeResetRecord(input.token);
      return {
        success: false,
        message: 'This reset link is invalid or expired. Request a new one to continue.',
      };
    }

    removeResetRecord(input.token);
    return { success: true, message: 'Your password has been reset.' };
  },
};
