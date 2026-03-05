/** Design tokens for consistent styling across mobile and web. */
export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#64748B',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  disabled: '#CBD5E1',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;
