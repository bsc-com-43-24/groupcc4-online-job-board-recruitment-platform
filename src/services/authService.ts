import type { Role } from '@/mock/types';
import { createAccount, findAccount, findAccountByEmail } from '@/mock/store';
import { apiConfigured, loginRequest, registerRequest } from './api';
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
}

export interface LoginInput {
  email: string;
  password: string;
  role: Role;
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const roleLabel = (role: Role) => (role === 'EMPLOYER' ? 'Employer' : 'Job Seeker');

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

/**
 * Frontend-only authentication against the demo store.
 *
 * When `NEXT_PUBLIC_API_URL` is configured the real endpoints are used
 * instead; there is no silent fallback to mock data once a backend exists, so
 * a broken backend is visible rather than disguised.
 */
export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    if (apiConfigured) {
      try {
        const response = await loginRequest(input);
        if (!response.success || !response.user) {
          return { success: false, message: response.message || 'Sign in failed.' };
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

    const account = findAccount(input.email, input.password);

    if (!account) {
      return {
        success: false,
        message: 'Email or password is incorrect.',
      };
    }

    if (account.role !== input.role) {
      return {
        success: false,
        message: `That email is registered as a ${roleLabel(account.role)}. Switch to the ${roleLabel(account.role)} tab to sign in.`,
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
};
