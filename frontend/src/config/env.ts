/**
 * Client-side environment configuration.
 * Only non-sensitive values are exposed to the client.
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  environment: (process.env.EXPO_PUBLIC_ENV || 'development') as 'development' | 'staging' | 'production',
} as const;
