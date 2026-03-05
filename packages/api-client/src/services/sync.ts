import type { QueuedAction } from '@fieldpay/core';
import type { HttpClient } from '../http';

export interface SyncResult {
  succeeded: string[];
  failed: { id: string; error: string }[];
}

export class SyncApi {
  constructor(private http: HttpClient) {}

  replayActions(actions: QueuedAction[]): Promise<SyncResult> {
    return this.http.post<SyncResult>('/sync/actions', { actions });
  }
}
