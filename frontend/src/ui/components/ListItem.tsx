import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

export function ListItem({ title, subtitle, right, onPress }: ListItemProps) {
  const content = (
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const rightContent = right && <View style={styles.right}>{right}</View>;

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.6}
      >
        {content}
        {rightContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {content}
      {rightContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  } as TextStyle,
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  } as TextStyle,
  right: {
    marginLeft: spacing.sm,
  } as ViewStyle,
});
