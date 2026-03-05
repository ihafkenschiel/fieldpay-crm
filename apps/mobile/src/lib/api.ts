import { FieldPayClient } from '@fieldpay/api-client';
import { env } from '../config/env';
import { useAuthStore } from '../stores/auth.store';

/**
 * Singleton API client instance.
 * Token provider is wired to the auth store for automatic header injection.
 */
export const api = new FieldPayClient(env.apiUrl);

// Wire up token provider to auth store
api.setTokenProvider(async () => {
  const { tokens } = useAuthStore.getState();
  return tokens?.accessToken ?? null;
});
