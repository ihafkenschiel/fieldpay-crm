import { create } from 'zustand';
import type { DiagnosticEvent, EventName } from '@fieldpay/core';
import { generateId } from '@fieldpay/core';

interface DiagnosticsState {
  events: DiagnosticEvent[];
  lastSyncTime: string | null;
  networkState: 'online' | 'offline' | 'unknown';

  logEvent: (name: EventName, metadata?: Record<string, unknown>) => void;
  setNetworkState: (state: 'online' | 'offline' | 'unknown') => void;
  setLastSyncTime: (time: string) => void;
  clearEvents: () => void;
}

const MAX_EVENTS = 100;

/**
 * Diagnostics store for observability.
 * Tracks events, network state, and sync status.
 */
export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
  events: [],
  lastSyncTime: null,
  networkState: 'unknown',

  logEvent: (name, metadata) => {
    const event: DiagnosticEvent = {
      id: generateId(),
      name,
      metadata,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      events: [event, ...state.events].slice(0, MAX_EVENTS),
    }));
  },

  setNetworkState: (networkState) => set({ networkState }),

  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),

  clearEvents: () => set({ events: [] }),
}));
