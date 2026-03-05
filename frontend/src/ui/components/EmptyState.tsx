import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  } as ViewStyle,
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  message: {
    fontSize: fontSize.sm,
    color: colors.disabled,
    textAlign: 'center',
    marginTop: spacing.sm,
  } as TextStyle,
});
