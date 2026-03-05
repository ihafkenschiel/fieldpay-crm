import { create } from 'zustand';
import type { QueuedAction, QueuedActionType } from '@fieldpay/core';
import { generateId, DEFAULT_MAX_ATTEMPTS } from '@fieldpay/core';

interface QueueState {
  actions: QueuedAction[];
  isSyncing: boolean;

  enqueue: (type: QueuedActionType, payload: Record<string, unknown>) => void;
  dequeue: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  incrementAttempts: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  clearQueue: () => void;
  getPendingActions: () => QueuedAction[];
}

/**
 * Offline action queue store.
 * Actions are queued when offline and replayed on reconnection.
 */
export const useQueueStore = create<QueueState>((set, get) => ({
  actions: [],
  isSyncing: false,

  enqueue: (type, payload) => {
    const action: QueuedAction = {
      id: generateId(),
      type,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ actions: [...state.actions, action] }));
  },

  dequeue: (id) => {
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== id),
    }));
  },

  markFailed: (id, error) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, status: 'failed' as const, lastError: error } : a,
      ),
    }));
  },

  incrementAttempts: (id) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, attempts: a.attempts + 1 } : a,
      ),
    }));
  },

  setSyncing: (isSyncing) => set({ isSyncing }),

  clearQueue: () => set({ actions: [] }),

  getPendingActions: () => get().actions.filter((a) => a.status === 'pending'),
}));
