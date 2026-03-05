export const AppConfig = {
  appName: 'Field Pay CRM',
  version: '1.0.0',
  defaultCurrency: 'usd',
  maxQueueRetries: 3,
  tokenRefreshBuffer: 5 * 60 * 1000, // Refresh 5 min before expiry
} as const;

export type Environment = 'development' | 'staging' | 'production';
