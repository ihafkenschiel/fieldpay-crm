import { useQuery } from '@tanstack/react-query';
import type { Account } from '@fieldpay/core';
import { api } from '../lib/api';

export function useAccounts(search?: string) {
  return useQuery<Account[]>({
    queryKey: ['accounts', search],
    queryFn: () => api.salesforce.getAccounts({ search }),
  });
}

export function useAccount(id: string) {
  return useQuery<Account>({
    queryKey: ['account', id],
    queryFn: () => api.salesforce.getAccount(id),
    enabled: !!id,
  });
}
