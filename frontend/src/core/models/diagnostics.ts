export interface DiagnosticEvent {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export const EventNames = {
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  AUTH_LOGOUT: 'auth_logout',
  SF_FETCH_ACCOUNTS: 'sf_fetch_accounts',
  SF_FETCH_CONTACTS: 'sf_fetch_contacts',
  INVOICE_CREATED: 'invoice_created',
  PAYMENT_INTENT_CREATED: 'payment_intent_created',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILURE: 'payment_failure',
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  QUEUE_ACTION_ADDED: 'queue_action_added',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];
