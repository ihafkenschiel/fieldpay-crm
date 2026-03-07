import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { EventNames, type Invoice } from '@fieldpay/core';

interface CreatePaymentIntentParams {
  invoiceId: string;
  amount: number;
  currency: string;
}

export function useCreatePaymentIntent() {
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: async (params: CreatePaymentIntentParams) => {
      console.debug('[payment] creating intent', params);
      const result = await api.stripe.createPaymentIntent(params);
      console.debug('[payment] intent created', result);
      return result;
    },
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
  accountId?: string;
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: async (params: ConfirmPaymentParams) => {
      console.debug('[payment] confirming via webhook', params);
      // In mock mode, we call the webhook endpoint directly to simulate confirmation
      const response = await fetch(`${api['http']['baseUrl']}/stripe/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await response.json();
      console.debug('[payment] webhook response', json);
      return json;
    },
    onSuccess: (result, variables) => {
      console.debug('[payment] success, updating cache', { result, variables });

      const updateInvoicesCache = (key: unknown) => {
        queryClient.setQueryData<Invoice[] | undefined>(key, (existing) => {
          if (!existing) return existing;
          return existing.map((invoice) =>
            invoice.id === variables.invoiceId
              ? {
                  ...invoice,
                  status: 'paid',
                  stripeChargeId: result?.chargeId ?? invoice.stripeChargeId,
                  stripePaymentIntentId: variables.paymentIntentId,
                }
              : invoice,
          );
        });
      };

      updateInvoicesCache(['invoices']);
      if (variables.accountId) {
        updateInvoicesCache(['invoices', variables.accountId]);
      }

      // Update single invoice cache
      queryClient.setQueryData<Invoice | null>(['invoice', variables.invoiceId], (existing) => {
        if (!existing) return existing;
        return {
          ...existing,
          status: 'paid',
          stripeChargeId: result?.chargeId ?? existing.stripeChargeId,
          stripePaymentIntentId: variables.paymentIntentId,
        };
      });

      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          (query.queryKey[0] === 'invoices' || query.queryKey[0] === 'invoice'),
      });
      console.debug('[payment] payment confirmed successfully', result);
      logEvent(EventNames.PAYMENT_SUCCESS);
    },
    onError: (error) => {
      console.error('[payment] failed to confirm', error);
      logEvent(EventNames.PAYMENT_FAILURE);
    },
  });
}
