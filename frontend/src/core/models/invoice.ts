export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'failed';

export interface Invoice {
  id: string;
  accountId: string;
  contactId?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  accountId: string;
  contactId?: string;
  amount: number;
  currency: string;
  description?: string;
}
