import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { EventNames } from '@fieldpay/core';

interface CreatePaymentIntentParams {
  invoiceId: string;
  amount: number;
  currency: string;
}

export function useCreatePaymentIntent() {
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: (params: CreatePaymentIntentParams) => api.stripe.createPaymentIntent(params),
    onSuccess: (result) => {
      logEvent(EventNames.PAYMENT_INTENT_CREATED, {
        paymentIntentId: result.paymentIntentId,
        amount: result.amount,
      });
    },
  });
}

interface ConfirmPaymentParams {
  paymentIntentId: string;
  invoiceId: string;
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: async (params: ConfirmPaymentParams) => {
      // In mock mode, we call the webhook endpoint directly to simulate confirmation
      const response = await fetch(`${api['http']['baseUrl']}/stripe/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      logEvent(EventNames.PAYMENT_SUCCESS);
    },
    onError: () => {
      logEvent(EventNames.PAYMENT_FAILURE);
    },
  });
}
