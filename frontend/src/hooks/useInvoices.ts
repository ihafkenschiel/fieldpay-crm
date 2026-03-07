import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Invoice, CreateInvoiceInput } from '@fieldpay/core';
import { api } from '../lib/api';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { EventNames } from '@fieldpay/core';

export function useInvoices(accountId?: string) {
  const queryKey = accountId ? ['invoices', accountId] : ['invoices'];

  return useQuery<Invoice[]>({
    queryKey,
    queryFn: () => api.salesforce.getInvoices(accountId),
  });
}

export function useInvoice(invoiceId: string | undefined) {
  return useQuery<Invoice | null>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const invoices = await api.salesforce.getInvoices();
      return invoices.find((inv) => inv.id === invoiceId) ?? null;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => api.salesforce.createInvoice(input),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'invoices',
      });
      logEvent(EventNames.INVOICE_CREATED, { invoiceId: invoice.id, amount: invoice.amount });
    },
  });
}
