import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Invoice, CreateInvoiceInput } from '@fieldpay/core';
import { api } from '../lib/api';
import { useDiagnosticsStore } from '../stores/diagnostics.store';
import { EventNames } from '@fieldpay/core';

export function useInvoices(accountId?: string) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', accountId],
    queryFn: () => api.salesforce.getInvoices(accountId),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => api.salesforce.createInvoice(input),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      logEvent(EventNames.INVOICE_CREATED, { invoiceId: invoice.id, amount: invoice.amount });
    },
  });
}
