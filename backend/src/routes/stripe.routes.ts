import type { FastifyInstance } from 'fastify';
import { StripeService } from '../services/stripe.service.js';
import { SalesforceService } from '../services/salesforce.service.js';
import { authGuard } from '../middleware/auth.guard.js';

const stripeService = new StripeService();
const sfService = SalesforceService;

export async function stripeRoutes(app: FastifyInstance) {
  // Payment intent creation requires auth
  app.post<{
    Body: { invoiceId: string; amount: number; currency: string };
  }>('/stripe/payment-intent', { preHandler: authGuard }, async (request, reply) => {
    const { invoiceId, amount, currency } = request.body;

    if (!invoiceId || !amount || !currency) {
      return reply.status(400).send({ error: 'invoiceId, amount, and currency are required' });
    }

    const result = await stripeService.createPaymentIntent({
      invoiceId,
      amount,
      currency,
    });

    // Update invoice with payment intent ID
    await sfService.updateInvoice(invoiceId, {
      status: 'pending',
      stripePaymentIntentId: result.paymentIntentId,
    });

    return result;
  });

  /**
   * Mock webhook endpoint.
   * In production, this would verify the Stripe signature and process
   * payment_intent.succeeded / payment_intent.payment_failed events.
   */
  app.post<{
    Body: { paymentIntentId: string; invoiceId: string };
  }>('/stripe/webhook', async (request, reply) => {
    const { paymentIntentId, invoiceId } = request.body;

    if (!paymentIntentId || !invoiceId) {
      return reply.status(400).send({ error: 'paymentIntentId and invoiceId are required' });
    }

    const confirmation = await stripeService.confirmPayment(paymentIntentId);

    if (confirmation.status === 'succeeded') {
      await sfService.updateInvoice(invoiceId, {
        status: 'paid',
        stripeChargeId: confirmation.chargeId,
      });
    } else {
      await sfService.updateInvoice(invoiceId, { status: 'failed' });
    }

    return { received: true, status: confirmation.status };
  });
}
