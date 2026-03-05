import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthTokens, AuthUser } from '@fieldpay/core';

const TOKEN_KEY = 'fieldpay_auth_tokens';

interface AuthState {
  tokens: AuthTokens | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (tokens: AuthTokens, user: AuthUser) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

/**
 * Auth store with secure token persistence.
 * Uses expo-secure-store on native, localStorage on web.
 */
export const useAuthStore = create<AuthState>((set) => ({
  tokens: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (tokens, user) => {
    await saveTokens(tokens);
    set({ tokens, user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await clearTokens();
    set({ tokens: null, user: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const tokens = await loadTokens();
      if (tokens && tokens.expiresAt > Date.now()) {
        set({ tokens, isAuthenticated: true, isLoading: false });
      } else {
        await clearTokens();
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Platform-specific secure storage helpers
async function saveTokens(tokens: AuthTokens): Promise<void> {
  const json = JSON.stringify(tokens);
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, json);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, json);
  }
}

async function loadTokens(): Promise<AuthTokens | null> {
  try {
    let json: string | null;
    // Check if we're in a web environment
    const isWeb = typeof window !== 'undefined' && window.localStorage;
    if (isWeb) {
      json = localStorage.getItem(TOKEN_KEY);
    } else {
      json = await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.warn('Failed to load auth tokens:', error);
    return null;
  }
}

async function clearTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
