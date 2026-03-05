import type { Account, Contact, Invoice } from '@fieldpay/core';

/** Realistic mock CRM data for demo mode. */

export const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    name: 'Acme Corporation',
    industry: 'Technology',
    phone: '+1 (415) 555-0100',
    website: 'https://acme.example.com',
  },
  {
    id: 'acc-002',
    name: 'Globex Industries',
    industry: 'Manufacturing',
    phone: '+1 (312) 555-0200',
    website: 'https://globex.example.com',
  },
  {
    id: 'acc-003',
    name: 'Initech Solutions',
    industry: 'Consulting',
    phone: '+1 (512) 555-0300',
    website: 'https://initech.example.com',
  },
  {
    id: 'acc-004',
    name: 'Umbrella Health',
    industry: 'Healthcare',
    phone: '+1 (617) 555-0400',
    website: 'https://umbrella-health.example.com',
  },
  {
    id: 'acc-005',
    name: 'Stark Energy',
    industry: 'Energy',
    phone: '+1 (713) 555-0500',
    website: 'https://stark-energy.example.com',
  },
  {
    id: 'acc-006',
    name: 'Wayne Financial',
    industry: 'Financial Services',
    phone: '+1 (212) 555-0600',
    website: 'https://wayne-fin.example.com',
  },
];

export const mockContacts: Contact[] = [
  { id: 'con-001', accountId: 'acc-001', firstName: 'Alice', lastName: 'Chen', email: 'alice.chen@acme.example.com', phone: '+1 (415) 555-0101', title: 'VP of Engineering' },
  { id: 'con-002', accountId: 'acc-001', firstName: 'Bob', lastName: 'Martinez', email: 'bob.martinez@acme.example.com', phone: '+1 (415) 555-0102', title: 'Procurement Manager' },
  { id: 'con-003', accountId: 'acc-002', firstName: 'Carol', lastName: 'Johnson', email: 'carol.j@globex.example.com', phone: '+1 (312) 555-0201', title: 'COO' },
  { id: 'con-004', accountId: 'acc-002', firstName: 'Dan', lastName: 'Smith', email: 'dan.smith@globex.example.com', phone: '+1 (312) 555-0202', title: 'Finance Director' },
  { id: 'con-005', accountId: 'acc-003', firstName: 'Eve', lastName: 'Williams', email: 'eve.w@initech.example.com', phone: '+1 (512) 555-0301', title: 'Managing Partner' },
  { id: 'con-006', accountId: 'acc-004', firstName: 'Frank', lastName: 'Lee', email: 'frank.lee@umbrella.example.com', phone: '+1 (617) 555-0401', title: 'Chief Medical Officer' },
  { id: 'con-007', accountId: 'acc-005', firstName: 'Grace', lastName: 'Kim', email: 'grace.kim@stark.example.com', phone: '+1 (713) 555-0501', title: 'Head of Operations' },
  { id: 'con-008', accountId: 'acc-006', firstName: 'Hank', lastName: 'Patel', email: 'hank.patel@wayne.example.com', phone: '+1 (212) 555-0601', title: 'Investment Director' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    accountId: 'acc-001',
    contactId: 'con-001',
    amount: 250000,
    currency: 'usd',
    status: 'paid',
    stripePaymentIntentId: 'pi_mock_001',
    stripeChargeId: 'ch_mock_001',
    description: 'Q4 Platform License',
    createdAt: '2024-10-15T10:30:00Z',
    updatedAt: '2024-10-16T14:00:00Z',
  },
  {
    id: 'inv-002',
    accountId: 'acc-002',
    contactId: 'con-003',
    amount: 175000,
    currency: 'usd',
    status: 'pending',
    description: 'Manufacturing Integration Setup',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'inv-003',
    accountId: 'acc-003',
    amount: 50000,
    currency: 'usd',
    status: 'draft',
    description: 'Consulting Engagement - Phase 1',
    createdAt: '2024-11-10T16:45:00Z',
    updatedAt: '2024-11-10T16:45:00Z',
  },
];
