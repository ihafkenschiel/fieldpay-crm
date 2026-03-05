/**
 * Format a cent amount to a display currency string.
 * Amount is in smallest currency unit (cents for USD).
 */
export function formatCurrency(amount: number, currency = 'usd'): string {
  const value = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

/** Format an ISO date string to a readable display format. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO date string to include time. */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Generate a simple UUID v4 for client-side IDs. */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
