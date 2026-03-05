# ADR-002: Offline Queue Synchronization

## Status

Accepted

## Context

Field sales representatives often work in environments with unreliable connectivity:
- Customer sites with poor cellular coverage
- Warehouses and industrial facilities
- Rural areas during travel

The application must support:
1. Creating invoices while offline
2. Queuing actions for later execution
3. Automatic sync when connectivity returns
4. Graceful handling of sync failures
5. Visibility into pending and failed actions

## Decision

Implement an **offline-first architecture** with a local action queue and automatic synchronization.

### Queue Model

```typescript
interface QueuedAction {
  id: string;
  type: 'create_invoice' | 'update_invoice' | 'sync_payment';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'failed';
  attempts: number;
  maxAttempts: number;  // default: 3
  lastError?: string;
  createdAt: string;
}
```

### Sync Flow

```
┌─────────────┐     Network      ┌─────────────┐
│   Client    │    Restored      │   Client    │
│  (Offline)  │ ───────────────▶ │  (Online)   │
└─────────────┘                  └──────┬──────┘
      │                                 │
      │ Queue Action                    │ Trigger Sync
      ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│ QueueStore  │                  │ SyncService │
│ (Zustand)   │                  │             │
└─────────────┘                  └──────┬──────┘
                                        │
                                        │ POST /sync/actions
                                        ▼
                                 ┌─────────────┐
                                 │     BFF     │
                                 └──────┬──────┘
                                        │
                                        │ Process Each Action
                                        ▼
                                 ┌─────────────┐
                                 │  Salesforce │
                                 └─────────────┘
```

### Components

1. **QueueStore** (Zustand)
   - In-memory store for queued actions
   - Persisted to AsyncStorage/localStorage for durability
   - Actions: enqueue, dequeue, markFailed, incrementAttempts

2. **NetworkMonitor** (NetInfo)
   - Subscribes to connectivity changes
   - Updates diagnostics store with current state

3. **SyncService**
   - Triggered on offline → online transition
   - Batches pending actions to `/sync/actions` endpoint
   - Handles partial success (some actions succeed, others fail)

4. **BFF /sync/actions Endpoint**
   - Receives array of QueuedAction
   - Processes sequentially
   - Returns `{ succeeded: string[], failed: { id, error }[] }`

### Retry Strategy

- **Max attempts**: 3 (configurable via `DEFAULT_MAX_ATTEMPTS`)
- **Failure handling**: After max attempts, action marked as `failed`
- **User visibility**: Failed actions shown in Diagnostics screen
- **Manual retry**: User can clear failed actions or retry manually

## Alternatives Considered

### 1. SQLite with Full Offline Database

**Approach**: Mirror Salesforce data locally in SQLite, sync bidirectionally.

**Rejected because**:
- Significant complexity for conflict resolution
- Requires schema synchronization
- Overkill for write-heavy operations (invoices)
- Demo scope doesn't require full offline read capability

### 2. Service Worker / Background Sync (Web Only)

**Approach**: Use Web Background Sync API.

**Rejected because**:
- Not available on native mobile platforms
- Inconsistent browser support
- Doesn't align with cross-platform goal

### 3. Redux Offline

**Approach**: Use redux-offline library for automatic persistence and sync.

**Rejected because**:
- Requires Redux (we chose Zustand for simplicity)
- Opinionated about action structure
- Less control over sync behavior

### 4. No Offline Support

**Approach**: Require connectivity for all operations.

**Rejected because**:
- Poor UX for field sales use case
- Competitive disadvantage
- Doesn't demonstrate enterprise-grade architecture

## Consequences

### Positive

- **Resilient UX**: Users can work without connectivity
- **Data integrity**: Actions queued, not lost
- **Transparency**: Users see pending/failed actions
- **Simplicity**: Action-based queue simpler than full data sync

### Negative

- **Eventual consistency**: Data may be stale until sync completes
- **Conflict potential**: Concurrent edits could conflict (mitigated by field sales workflow)
- **Storage limits**: Large queues could impact performance

### Mitigations

- **Stale data**: Show "last synced" timestamp in UI
- **Conflicts**: Invoice creation is append-only; updates are rare
- **Storage**: Cap queue size; alert user if approaching limit

## Implementation Notes

### Network Detection

```typescript
NetInfo.addEventListener((state) => {
  const status = state.isConnected ? 'online' : 'offline';
  setNetworkState(status);
});
```

### Auto-Sync Trigger

```typescript
useEffect(() => {
  if (wasOffline && isNowOnline && pendingCount > 0) {
    syncQueuedActions();
  }
}, [networkState]);
```

### Sync Response Handling

```typescript
// Remove succeeded
for (const id of result.succeeded) {
  queueStore.dequeue(id);
}

// Handle failed
for (const failure of result.failed) {
  queueStore.incrementAttempts(failure.id);
  if (attempts >= maxAttempts) {
    queueStore.markFailed(failure.id, failure.error);
  }
}
```

## Future Enhancements

1. **Persistent queue**: Save to SQLite for app restart durability
2. **Background sync**: Use native background task APIs
3. **Conflict resolution**: Implement last-write-wins or merge strategies
4. **Offline reads**: Cache frequently accessed data locally
