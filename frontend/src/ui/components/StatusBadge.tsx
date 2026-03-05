import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: colors.success },
  warning: { bg: '#FEF3C7', text: colors.warning },
  danger: { bg: '#FEE2E2', text: colors.danger },
  info: { bg: '#DBEAFE', text: colors.primary },
  neutral: { bg: '#F1F5F9', text: colors.secondary },
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const vc = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vc.bg }]}>
      <Text style={[styles.text, { color: vc.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  } as ViewStyle,
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
});
