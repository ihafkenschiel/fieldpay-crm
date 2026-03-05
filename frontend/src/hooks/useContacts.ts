import { useQuery } from '@tanstack/react-query';
import type { Contact } from '@fieldpay/core';
import { api } from '../lib/api';

export function useContacts(accountId: string) {
  return useQuery<Contact[]>({
    queryKey: ['contacts', accountId],
    queryFn: () => api.salesforce.getContacts(accountId),
    enabled: !!accountId,
  });
}
