import type { FastifyInstance } from 'fastify';
import type { QueuedAction } from '@fieldpay/core';
import { SalesforceService } from '../services/salesforce.service.js';
import { authGuard } from '../middleware/auth.guard.js';

const sfService = new SalesforceService();

export async function syncRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard);

  /**
   * Replay queued offline actions.
   * Each action is processed sequentially; failures don't block subsequent actions.
   */
  app.post<{ Body: { actions: QueuedAction[] } }>('/sync/actions', async (request) => {
    const { actions } = request.body;
    const succeeded: string[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'create_invoice':
            await sfService.createInvoice(action.payload as any);
            break;
          case 'update_invoice': {
            const { invoiceId, ...updates } = action.payload as any;
            await sfService.updateInvoice(invoiceId, updates);
            break;
          }
          case 'sync_payment':
            // Payment sync is handled via the stripe webhook flow
            break;
          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }
        succeeded.push(action.id);
      } catch (err) {
        failed.push({
          id: action.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return { succeeded, failed };
  });
}
