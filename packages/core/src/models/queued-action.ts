export type QueuedActionType = 'create_invoice' | 'update_invoice' | 'sync_payment';
export type QueuedActionStatus = 'pending' | 'processing' | 'failed';

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  status: QueuedActionStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
}

export const DEFAULT_MAX_ATTEMPTS = 3;
