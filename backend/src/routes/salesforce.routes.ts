import type { FastifyInstance } from 'fastify';
import type { CreateInvoiceInput } from '@fieldpay/core';
import { SalesforceService } from '../services/salesforce.service.js';
import { authGuard } from '../middleware/auth.guard.js';

const sfService = new SalesforceService();

export async function salesforceRoutes(app: FastifyInstance) {
  // All Salesforce routes require authentication
  app.addHook('preHandler', authGuard);

  // --- Accounts ---

  app.get<{ Querystring: { search?: string } }>('/salesforce/accounts', async (request) => {
    const { search } = request.query;
    return sfService.getAccounts(search);
  });

  app.get<{ Params: { id: string } }>('/salesforce/accounts/:id', async (request, reply) => {
    const account = await sfService.getAccount(request.params.id);
    if (!account) {
      return reply.status(404).send({ error: 'Account not found' });
    }
    return account;
  });

  app.get<{ Params: { id: string } }>('/salesforce/accounts/:id/contacts', async (request) => {
    return sfService.getContacts(request.params.id);
  });

  // --- Invoices ---

  app.get<{ Querystring: { accountId?: string } }>('/salesforce/invoices', async (request) => {
    return sfService.getInvoices(request.query.accountId);
  });

  app.post<{ Body: CreateInvoiceInput }>('/salesforce/invoices', async (request, reply) => {
    const { accountId, amount, currency } = request.body;

    if (!accountId || !amount || !currency) {
      return reply.status(400).send({ error: 'accountId, amount, and currency are required' });
    }

    const invoice = await sfService.createInvoice(request.body);
    return reply.status(201).send(invoice);
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/salesforce/invoices/:id',
    async (request, reply) => {
      const invoice = await sfService.updateInvoice(request.params.id, request.body as any);
      if (!invoice) {
        return reply.status(404).send({ error: 'Invoice not found' });
      }
      return invoice;
    },
  );
}
