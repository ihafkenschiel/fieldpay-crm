import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,

  salesforceMode: (process.env.SALESFORCE_MODE || 'mock') as 'mock' | 'live',
  salesforceClientId: process.env.SALESFORCE_CLIENT_ID || '',
  salesforceClientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  salesforceRedirectUri: process.env.SALESFORCE_REDIRECT_URI || '',

  stripeMode: (process.env.STRIPE_MODE || 'mock') as 'mock' | 'live',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  jwtSecret: process.env.JWT_SECRET || 'fieldpay-dev-secret',
} as const;
