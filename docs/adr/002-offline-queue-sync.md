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
  type: QueuedActionType;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
}

type QueuedActionType = 'create_invoice' | 'update_invoice' | 'sync_payment';
```

### QueuedAction Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID generated client-side when action is queued |
| `type` | `QueuedActionType` | Discriminator for action processing on server |
| `payload` | `Record<string, unknown>` | Action-specific data (e.g., invoice fields) |
| `status` | `enum` | Current state: `pending` (awaiting sync), `processing` (sync in progress), `failed` (exceeded max retries) |
| `attempts` | `number` | Number of sync attempts made; starts at 0 |
| `maxAttempts` | `number` | Maximum retries before marking failed; default 3 |
| `lastError` | `string?` | Error message from most recent failed attempt |
| `createdAt` | `string` | ISO 8601 timestamp when action was queued |

### Action Type Payloads

**`create_invoice`**:
```typescript
{
  accountId: string;
  amount: number;
  currency: string;
  description?: string;
}
```

**`update_invoice`**:
```typescript
{
  invoiceId: string;
  status?: InvoiceStatus;
  stripePaymentIntentId?: string;
}
```

**`sync_payment`**:
```typescript
{
  invoiceId: string;
  paymentIntentId: string;
  chargeId: string;
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

---

## Conflict Resolution Strategy

Offline synchronization introduces the possibility of conflicts when client state differs from server state. This section documents the conflict resolution approach.

### Conflict Scenarios

| Scenario | Example | Resolution |
|----------|---------|------------|
| Create collision | Two clients create invoices with same temporary ID | Server assigns unique IDs; no conflict |
| Update collision | Client updates invoice while offline; another user updates same invoice | Server wins (last-write-wins) |
| Delete collision | Client updates invoice that was deleted on server | Server wins; action fails with "not found" |
| Stale reference | Client references account that was deleted | Action fails; logged for manual review |

### Resolution Rules

1. **Server wins for immutable data**: Account and contact records are read-only from the mobile client. Server state is always authoritative.

2. **Client wins for newly created objects**: Invoices created offline are treated as new records. The server assigns the canonical ID on sync.

3. **Last-write-wins for updates**: If multiple clients update the same invoice, the last sync to reach the server wins. This is acceptable because:
   - Field sales workflows rarely involve concurrent edits to the same invoice
   - Invoices progress through a linear lifecycle (draft → pending → paid)

4. **Conflicts logged for manual reconciliation**: When an action fails due to a conflict, the error is logged with full context:
   ```typescript
   {
     actionId: string;
     actionType: string;
     error: string;
     serverState?: Record<string, unknown>;
     clientState: Record<string, unknown>;
     timestamp: string;
   }
   ```

### User Notification

- Failed actions appear in the Diagnostics screen with error details
- Users can manually review and retry or discard failed actions
- Critical conflicts (e.g., payment sync failures) should trigger push notifications in production

---

## Failure Handling

### Retry Strategy

The sync engine implements exponential backoff with jitter to handle transient failures:

| Attempt | Base Delay | With Jitter |
|---------|------------|-------------|
| 1 | Immediate | 0ms |
| 2 | 1 second | 500-1500ms |
| 3 | 2 seconds | 1000-3000ms |

**Note**: Current implementation uses immediate retry. Exponential backoff is recommended for production.

### Max Retry Attempts

- **Default**: 3 attempts per action
- **Configurable**: Via `DEFAULT_MAX_ATTEMPTS` constant in `@fieldpay/core`
- **Rationale**: 3 attempts balances persistence with avoiding infinite loops on permanent failures

### Failure Classification

| Error Type | Retryable | Action |
|------------|-----------|--------|
| Network timeout | Yes | Retry with backoff |
| 5xx server error | Yes | Retry with backoff |
| 4xx client error | No | Mark failed immediately |
| 401 Unauthorized | No | Trigger re-authentication |
| 404 Not Found | No | Mark failed; resource deleted |
| 409 Conflict | No | Mark failed; log for review |

### Permanent Failure Handling

When an action exceeds max retries:

1. Action status set to `failed`
2. `lastError` populated with error message
3. Action remains in queue for user review
4. `sync_failed` diagnostic event emitted
5. User sees failed action count in Diagnostics screen

### User Notification for Permanent Failures

In production, permanent sync failures should notify users:

- **In-app**: Badge on Diagnostics tab showing failed count
- **Push notification**: "X actions failed to sync. Please review."
- **Email**: Daily digest of failed actions (for critical workflows)

### Manual Recovery Options

Users can take the following actions on failed items:

1. **Retry**: Reset attempts to 0 and re-queue for next sync
2. **Discard**: Remove action from queue (data loss accepted)
3. **Edit**: Modify payload and retry (future enhancement)

---

## Future Enhancements

1. **Persistent queue**: Save to SQLite for app restart durability
2. **Background sync**: Use native background task APIs (iOS BackgroundTasks, Android WorkManager)
3. **Exponential backoff**: Implement proper retry delays with jitter
4. **Offline reads**: Cache frequently accessed data locally
5. **Conflict UI**: Dedicated screen for reviewing and resolving conflicts
6. **Sync progress**: Show progress indicator during multi-action sync
