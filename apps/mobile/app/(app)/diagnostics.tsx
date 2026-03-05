import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, ScreenContainer, StatusBadge, colors, spacing, fontSize } from '@fieldpay/ui';
import { useAuthStore } from '../../src/stores/auth.store';
import { useDiagnosticsStore } from '../../src/stores/diagnostics.store';
import { useQueueStore } from '../../src/stores/queue.store';
import { AppConfig, formatDateTime } from '@fieldpay/core';
import { env } from '../../src/config/env';

export default function DiagnosticsScreen() {
  const { user, clearAuth } = useAuthStore();
  const { events, lastSyncTime, networkState, clearEvents } = useDiagnosticsStore();
  const { actions: queuedActions } = useQueueStore();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  const networkVariant = networkState === 'online' ? 'success' : networkState === 'offline' ? 'danger' : 'neutral';

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Version:</Text>
          <Text style={styles.value}>{AppConfig.version}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Environment:</Text>
          <Text style={styles.value}>{env.environment}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>API URL:</Text>
          <Text style={styles.value}>{env.apiUrl}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Network:</Text>
          <StatusBadge label={networkState} variant={networkVariant} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Last Sync:</Text>
          <Text style={styles.value}>{lastSyncTime ? formatDateTime(lastSyncTime) : 'Never'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Queued Actions:</Text>
          <Text style={styles.value}>{queuedActions.length}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>User</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user?.name || 'Not logged in'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>
        </View>
        <Button title="Logout" variant="danger" onPress={handleLogout} style={styles.logoutButton} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <TouchableOpacity onPress={clearEvents}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>No events recorded</Text>
        ) : (
          <FlatList
            data={events.slice(0, 20)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.eventRow}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          />
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 100,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  clearButton: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventName: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  eventTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
