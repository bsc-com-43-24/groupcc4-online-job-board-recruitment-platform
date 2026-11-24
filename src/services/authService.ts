import type { Role } from '@/mock/types';
import {
  ApiRequestError,
  apiErrorMessage,
  authApi,
  employerApi,
  profileApi,
  type UserResponse,
} from './api';
import { clearSession, persistSession } from './session';

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
  role?: Role;
  name?: string;
  companyName?: string;
}

function bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

function validatePassword(password: string): string | null {
  if (password.length < 12 || bytes(password) > 72) {
    return 'Use a password between 12 and 72 characters.';
  }
  return null;
}

function emailPrefix(email: string): string {
  return email.split('@')[0] || 'User';
}

function toAuthUser(user: UserResponse, name: string): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name,
  };
}

async function resolveDisplayName(user: UserResponse): Promise<string> {
  if (user.role === 'JOB_SEEKER') {
    try {
      const profile = await profileApi.get();
      return profile.displayName || profile.fullName || emailPrefix(user.email);
    } catch {
      return emailPrefix(user.email);
    }
  }

  if (user.role === 'EMPLOYER') {
    try {
      const companies = await employerApi.companies();
      return companies[0]?.name || emailPrefix(user.email);
    } catch {
      return emailPrefix(user.email);
    }
  }

  return emailPrefix(user.email);
}

async function startSession(token: string): Promise<AuthResponse> {
  const user = await authApi.currentUser();

  if (user.accountStatus !== 'ACTIVE') {
    clearSession();
    return {
      success: false,
      message: 'This account is not active. Contact an administrator for help.',
    };
  }

  const name = await resolveDisplayName(user);
  const authUser = toAuthUser(user, name);

  persistSession(
    {
      userId: authUser.id,
      role: authUser.role,
      name: authUser.name,
      email: authUser.email,
    },
    token,
  );

  return {
    success: true,
    message: 'Signed in.',
    token,
    user: authUser,
  };
}

function failure(error: unknown, fallback: string): AuthResponse {
  const networkError = error instanceof ApiRequestError && error.kind === 'network';
  return {
    success: false,
    message: apiErrorMessage(error) || fallback,
    networkError,
  };
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await authApi.login({
        email: input.email.trim(),
        password: input.password,
      });

      if (!response.accessToken) {
        return {
          success: false,
          message: 'The server did not return an authentication token.',
        };
      }

      return await startSession(response.accessToken);
    } catch (error) {
      if (
        error instanceof ApiRequestError &&
        error.status === 401
      ) {
        return {
          success: false,
          message: 'The email or password was incorrect.',
        };
      }
      return failure(error, 'Could not sign in. Please try again.');
    }
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const invalidPassword = validatePassword(input.password);
    if (invalidPassword) {
      return { success: false, message: invalidPassword };
    }

    try {
      await authApi.register({
        email: input.email.trim(),
        password: input.password,
      });
    } catch (error) {
      return failure(error, 'Could not create your account. Please try again.');
    }

    return this.login({
      email: input.email.trim(),
      password: input.password,
    });
  },

  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
    resetUrl?: string;
  }> {
    try {
      const response = await authApi.forgotPassword(email.trim());
      const resetUrl =
        response.resetToken && typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password?token=${encodeURIComponent(response.resetToken)}`
          : undefined;

      return {
        success: true,
        message:
          response.message ??
          'If an account exists for that email, reset instructions are on the way.',
        resetUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: apiErrorMessage(error),
      };
    }
  },

  async resetPassword(input: { token: string; password: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    const invalidPassword = validatePassword(input.password);
    if (invalidPassword) {
      return { success: false, message: invalidPassword };
    }

    try {
      const response = await authApi.resetPassword({
        token: input.token,
        password: input.password,
      });
      return {
        success: true,
        message: response.message ?? 'Your password has been reset.',
      };
    } catch (error) {
      return {
        success: false,
        message: apiErrorMessage(error),
      };
    }
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const invalidPassword = validatePassword(input.newPassword);
    if (invalidPassword) {
      return { success: false, message: invalidPassword };
    }

    try {
      await authApi.changePassword(input);
      return { success: true, message: 'Your password has been changed.' };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error) };
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      clearSession();
      return;
    }
    clearSession();
  },
};
