import { v4 as uuid } from 'uuid';

export interface CreatePaymentIntentInput {
  invoiceId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/**
 * Mock Stripe service.
 * In production, replace with real Stripe SDK calls:
 *   const stripe = new Stripe(env.stripeSecretKey);
 *   stripe.paymentIntents.create(...)
 */
export class StripeService {
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));

    const paymentIntentId = `pi_mock_${uuid().slice(0, 12)}`;
    const clientSecret = `${paymentIntentId}_secret_${uuid().slice(0, 8)}`;

    return {
      clientSecret,
      paymentIntentId,
      amount: input.amount,
      currency: input.currency,
    };
  }

  /**
   * Simulate confirming a payment (called after client-side confirmation).
   * In production, this would be handled by Stripe webhooks.
   */
  async confirmPayment(paymentIntentId: string): Promise<{
    chargeId: string;
    status: 'succeeded' | 'failed';
  }> {
    await new Promise((r) => setTimeout(r, 300));

    return {
      chargeId: `ch_mock_${uuid().slice(0, 12)}`,
      status: 'succeeded',
    };
  }
}
