import { api } from '../lib/api';
import { useQueueStore } from '../stores/queue.store';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { EventNames } from '@fieldpay/core';

/**
 * Sync engine for replaying queued offline actions.
 * Called when network connectivity is restored.
 */
export async function syncQueuedActions(): Promise<void> {
  const queueStore = useQueueStore.getState();
  const diagnosticsStore = useDiagnosticsStore.getState();

  const pendingActions = queueStore.getPendingActions();

  if (pendingActions.length === 0) {
    return;
  }

  queueStore.setSyncing(true);
  diagnosticsStore.logEvent(EventNames.SYNC_STARTED, { count: pendingActions.length });

  try {
    const result = await api.sync.replayActions(pendingActions);

    // Remove succeeded actions from queue
    for (const id of result.succeeded) {
      queueStore.dequeue(id);
    }

    // Mark failed actions
    for (const failure of result.failed) {
      const action = pendingActions.find((a) => a.id === failure.id);
      if (action) {
        queueStore.incrementAttempts(failure.id);
        if (action.attempts + 1 >= action.maxAttempts) {
          queueStore.markFailed(failure.id, failure.error);
        }
      }
    }

    diagnosticsStore.setLastSyncTime(new Date().toISOString());
    diagnosticsStore.logEvent(EventNames.SYNC_COMPLETED, {
      succeeded: result.succeeded.length,
      failed: result.failed.length,
    });
  } catch (error) {
    diagnosticsStore.logEvent(EventNames.SYNC_FAILED, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    queueStore.setSyncing(false);
  }
}
