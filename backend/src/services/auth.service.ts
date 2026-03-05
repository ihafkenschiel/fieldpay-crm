import { v4 as uuid } from 'uuid';
import type { AuthTokens, AuthUser } from '@fieldpay/core';

/**
 * Mock auth service simulating Salesforce OAuth.
 * In production, this would exchange an OAuth authorization code
 * with Salesforce and manage token lifecycle.
 */

// In-memory token store for the demo
const validTokens = new Map<string, { user: AuthUser; expiresAt: number; refreshToken: string }>();

const MOCK_USER: AuthUser = {
  id: 'user-001',
  name: 'Jordan Rivera',
  email: 'jordan.rivera@fieldpay.example.com',
};

// Demo credentials
const DEMO_USERNAME = 'demo@fieldpay.com';
const DEMO_PASSWORD = 'demo123';

const TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour

export class AuthService {
  async login(username: string, password: string): Promise<{ tokens: AuthTokens; user: AuthUser } | null> {
    // In demo mode, accept demo credentials
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return null;
    }

    const accessToken = `fp_at_${uuid()}`;
    const refreshToken = `fp_rt_${uuid()}`;
    const expiresAt = Date.now() + TOKEN_LIFETIME;

    validTokens.set(accessToken, {
      user: MOCK_USER,
      expiresAt,
      refreshToken,
    });

    return {
      tokens: {
        accessToken,
        refreshToken,
        instanceUrl: 'https://mock.salesforce.example.com',
        expiresAt,
      },
      user: MOCK_USER,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens | null> {
    // Find session by refresh token
    for (const [oldToken, session] of validTokens.entries()) {
      if (session.refreshToken === refreshToken) {
        validTokens.delete(oldToken);

        const newAccessToken = `fp_at_${uuid()}`;
        const newRefreshToken = `fp_rt_${uuid()}`;
        const expiresAt = Date.now() + TOKEN_LIFETIME;

        validTokens.set(newAccessToken, {
          user: session.user,
          expiresAt,
          refreshToken: newRefreshToken,
        });

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          instanceUrl: 'https://mock.salesforce.example.com',
          expiresAt,
        };
      }
    }
    return null;
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    const session = validTokens.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      validTokens.delete(token);
      return null;
    }
    return session.user;
  }

  async logout(token: string): Promise<void> {
    validTokens.delete(token);
  }
}
