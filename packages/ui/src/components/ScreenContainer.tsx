import React from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, style }: ScreenContainerProps) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  } as ViewStyle,
});
