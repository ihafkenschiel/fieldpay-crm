import { useEffect, useRef } from 'react';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { useQueueStore } from '../stores/queue.store';
import { syncQueuedActions } from '../services/sync.service';

/**
 * Hook that triggers sync when network comes back online.
 * Should be mounted at the app root level.
 */
export function useAutoSync() {
  const networkState = useDiagnosticsStore((s) => s.networkState);
  const pendingCount = useQueueStore((s) => s.actions.filter((a) => a.status === 'pending').length);
  const isSyncing = useQueueStore((s) => s.isSyncing);
  const previousNetworkState = useRef(networkState);

  useEffect(() => {
    // Trigger sync when transitioning from offline to online
    const wasOffline = previousNetworkState.current === 'offline';
    const isNowOnline = networkState === 'online';

    if (wasOffline && isNowOnline && pendingCount > 0 && !isSyncing) {
      syncQueuedActions();
    }

    previousNetworkState.current = networkState;
  }, [networkState, pendingCount, isSyncing]);
}

/**
 * Hook to manually trigger sync.
 */
export function useSyncActions() {
  const isSyncing = useQueueStore((s) => s.isSyncing);
  const pendingCount = useQueueStore((s) => s.actions.filter((a) => a.status === 'pending').length);

  const sync = async () => {
    if (!isSyncing && pendingCount > 0) {
      await syncQueuedActions();
    }
  };

  return { sync, isSyncing, pendingCount };
}
