import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Card, ListItem, ScreenContainer, colors, spacing, fontSize } from '@fieldpay/ui';
import { useAccount } from '../../../src/hooks/useAccounts';
import { useContacts } from '../../../src/hooks/useContacts';
import { useInvoices } from '../../../src/hooks/useInvoices';
import { formatCurrency } from '@fieldpay/core';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = id as string;
  const { data: account } = useAccount(accountId);
  const { data: contacts } = useContacts(accountId);
  const { data: invoices } = useInvoices(accountId);

  if (!account) {
    return null;
  }

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.industry}>{account.industry}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{account.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Website:</Text>
          <Text style={styles.value}>{account.website}</Text>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contacts</Text>
        </View>
        {contacts?.map((contact) => (
          <ListItem
            key={contact.id}
            title={`${contact.firstName} ${contact.lastName}`}
            subtitle={contact.title}
          />
        ))}
        {contacts?.length === 0 && (
          <Text style={styles.emptyText}>No contacts</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Invoices</Text>
          <Button
            title="+ New"
            variant="ghost"
            onPress={() => router.push(`/(app)/invoices/create?accountId=${id}`)}
            style={styles.newButton}
          />
        </View>
        {invoices?.map((invoice) => (
          <ListItem
            key={invoice.id}
            title={invoice.description || `Invoice ${invoice.id}`}
            subtitle={`${formatCurrency(invoice.amount, invoice.currency)} • ${invoice.status}`}
            onPress={() => router.push(`/(app)/invoices/${invoice.id}`)}
          />
        ))}
        {invoices?.length === 0 && (
          <Text style={styles.emptyText}>No invoices</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  accountName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  industry: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 70,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  newButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 32,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    padding: spacing.md,
  },
});
