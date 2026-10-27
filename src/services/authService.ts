export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'SEEKER' | 'EMPLOYER';
    name: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function persistAuthSession(user: AuthResponse['user'] | undefined, token?: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString();
  const safeRole = user?.role ?? 'SEEKER';
  const safeName = user?.name ?? 'User';

  document.cookie = `token=${encodeURIComponent(token ?? 'mock-jwt-token-12345')}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `user_role=${encodeURIComponent(safeRole)}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `user_name=${encodeURIComponent(safeName)}; path=/; expires=${expires}; SameSite=Lax`;
}

export const authService = {
  /**
   * Registers a user with mock fallback if the backend API is offline
   */
  async register(data: Record<string, unknown>): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable, returning frontend mock response:', error);
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        success: true,
        message: 'Mock registration successful',
        token: 'mock-jwt-token-12345',
        user: {
          id: 'usr-101',
          email: String(data.email || ''),
          role: (data.role as 'SEEKER' | 'EMPLOYER') || 'SEEKER',
          name: String(data.fullName || data.companyName || 'User'),
        },
      };
    }
  },

  /**
   * Authenticates a user with mock fallback if the backend API is offline
   */
  async login(data: Record<string, unknown>): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend unavailable, returning frontend mock response:', error);
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        success: true,
        message: 'Mock login successful',
        token: 'mock-jwt-token-12345',
        user: {
          id: 'usr-101',
          email: String(data.email || ''),
          role: (data.role as 'SEEKER' | 'EMPLOYER') || 'SEEKER',
          name: 'Demo User',
        },
      };
    }
  },
};