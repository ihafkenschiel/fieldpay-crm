import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ListItem, StatusBadge, EmptyState, Button, colors, spacing } from '@fieldpay/ui';
import { useInvoices } from '../../../src/hooks/useInvoices';
import { formatCurrency } from '@fieldpay/core';
import type { InvoiceStatus } from '@fieldpay/core';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  draft: 'neutral',
};

export default function InvoicesScreen() {
  const { data: invoices, isLoading, refetch } = useInvoices();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="+ Create Invoice"
          onPress={() => router.push('/(app)/invoices/create')}
        />
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.description || `Invoice ${item.id}`}
            subtitle={formatCurrency(item.amount, item.currency)}
            right={<StatusBadge label={item.status} variant={statusVariant[item.status]} />}
            onPress={() => router.push(`/(app)/invoices/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No invoices"
              message="Create your first invoice to get started"
            />
          ) : null
        }
        contentContainerStyle={invoices?.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyList: {
    flex: 1,
  },
});
