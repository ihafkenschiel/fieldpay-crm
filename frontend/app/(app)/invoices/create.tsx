import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, TextInput, ScreenContainer, Card, colors, spacing, fontSize } from '@fieldpay/ui';
import { useCreateInvoice } from '../../../src/hooks/useInvoices';
import { useAccounts } from '../../../src/hooks/useAccounts';

export default function CreateInvoiceScreen() {
  const { accountId: preselectedAccountId } = useLocalSearchParams<{ accountId?: string }>();
  const { data: accounts } = useAccounts();

  const [accountId, setAccountId] = useState(preselectedAccountId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createInvoice = useCreateInvoice();

  const handleCreate = async () => {
    setError('');

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        accountId,
        amount: amountCents,
        currency: 'usd',
        description: description || undefined,
      });
      router.replace(`/(app)/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  };

  const selectedAccount = accounts?.find((a) => a.id === accountId);

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Text style={styles.title}>Create Invoice</Text>

        <Text style={styles.label}>Account</Text>
        {preselectedAccountId && selectedAccount ? (
          <Text style={styles.selectedAccount}>{selectedAccount.name}</Text>
        ) : (
          <View style={styles.accountPicker}>
            {accounts?.map((account) => (
              <Button
                key={account.id}
                title={account.name}
                variant={accountId === account.id ? 'primary' : 'secondary'}
                onPress={() => setAccountId(account.id)}
                style={styles.accountButton}
              />
            ))}
          </View>
        )}

        <TextInput
          label="Amount (USD)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Invoice description..."
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Create Invoice"
          onPress={handleCreate}
          loading={createInvoice.isPending}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectedAccount: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  accountPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accountButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
});
