import type { Account, Contact, Invoice, CreateInvoiceInput } from '@fieldpay/core';
import { v4 as uuid } from 'uuid';
import { mockAccounts, mockContacts, mockInvoices } from '../data/mock-data.js';

/**
 * Mock Salesforce service.
 * Implements the same interface a live Salesforce REST API adapter would.
 * In production, swap this with a real JSforce or REST-based implementation.
 */
class SalesforceServiceImpl {
  // In-memory mutable copies for the demo session
  private accounts: Account[] = [...mockAccounts];
  private contacts: Contact[] = [...mockContacts];
  private invoices: Invoice[] = [...mockInvoices];

  async getAccounts(search?: string): Promise<Account[]> {
    if (!search) return this.accounts;
    const q = search.toLowerCase();
    return this.accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q),
    );
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.find((a) => a.id === id);
  }

  async getContacts(accountId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.accountId === accountId);
  }

  async getInvoices(accountId?: string): Promise<Invoice[]> {
    if (!accountId) return this.invoices;
    return this.invoices.filter((i) => i.accountId === accountId);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.find((i) => i.id === id);
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: `inv-${uuid().slice(0, 8)}`,
      accountId: input.accountId,
      contactId: input.contactId,
      amount: input.amount,
      currency: input.currency,
      status: 'draft',
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };
    this.invoices.push(invoice);
    return invoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const idx = this.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.invoices[idx] = {
      ...this.invoices[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.invoices[idx];
  }
}

// Export singleton instance so all routes share the same in-memory data
export const SalesforceService = new SalesforceServiceImpl();
export type { SalesforceServiceImpl };
