import type { Account, AccountListParams, Contact, Invoice, CreateInvoiceInput } from '@fieldpay/core';
import type { HttpClient } from '../http';

export class SalesforceApi {
  constructor(private http: HttpClient) {}

  getAccounts(params?: AccountListParams): Promise<Account[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return this.http.get<Account[]>(`/salesforce/accounts${qs ? `?${qs}` : ''}`);
  }

  getAccount(id: string): Promise<Account> {
    return this.http.get<Account>(`/salesforce/accounts/${id}`);
  }

  getContacts(accountId: string): Promise<Contact[]> {
    return this.http.get<Contact[]>(`/salesforce/accounts/${accountId}/contacts`);
  }

  getInvoices(accountId?: string): Promise<Invoice[]> {
    const qs = accountId ? `?accountId=${accountId}` : '';
    return this.http.get<Invoice[]>(`/salesforce/invoices${qs}`);
  }

  createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    return this.http.post<Invoice>('/salesforce/invoices', input);
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    return this.http.patch<Invoice>(`/salesforce/invoices/${id}`, updates);
  }
}
