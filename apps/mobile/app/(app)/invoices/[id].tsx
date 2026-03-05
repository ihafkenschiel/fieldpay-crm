import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, Card, StatusBadge, ScreenContainer, colors, spacing, fontSize } from '@fieldpay/ui';
import { useInvoices } from '../../../src/hooks/useInvoices';
import { useCreatePaymentIntent, useConfirmPayment } from '../../../src/hooks/usePayment';
import { formatCurrency, formatDateTime } from '@fieldpay/core';
import type { InvoiceStatus } from '@fieldpay/core';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  draft: 'neutral',
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoices } = useInvoices();
  const invoice = invoices?.find((i) => i.id === id);

  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'confirming'>('idle');

  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  const handlePayment = async () => {
    if (!invoice) return;

    setPaymentStep('processing');

    try {
      // Step 1: Create PaymentIntent
      const paymentIntent = await createPaymentIntent.mutateAsync({
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
      });

      setPaymentStep('confirming');

      // Step 2: In a real app, this would open Stripe's payment sheet
      // For mock mode, we simulate the confirmation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 3: Confirm payment via webhook simulation
      await confirmPayment.mutateAsync({
        paymentIntentId: paymentIntent.paymentIntentId,
        invoiceId: invoice.id,
      });

      Alert.alert('Success', 'Payment completed successfully!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setPaymentStep('idle');
    }
  };

  if (!invoice) {
    return null;
  }

  const canPay = invoice.status === 'draft' || invoice.status === 'pending';
  const isProcessing = paymentStep !== 'idle';

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.invoiceId}>Invoice {invoice.id}</Text>
          <StatusBadge label={invoice.status} variant={statusVariant[invoice.status]} />
        </View>

        <Text style={styles.amount}>{formatCurrency(invoice.amount, invoice.currency)}</Text>

        {invoice.description && (
          <Text style={styles.description}>{invoice.description}</Text>
        )}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDateTime(invoice.createdAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Updated:</Text>
            <Text style={styles.value}>{formatDateTime(invoice.updatedAt)}</Text>
          </View>
          {invoice.stripePaymentIntentId && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Payment ID:</Text>
              <Text style={styles.value}>{invoice.stripePaymentIntentId}</Text>
            </View>
          )}
          {invoice.stripeChargeId && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Charge ID:</Text>
              <Text style={styles.value}>{invoice.stripeChargeId}</Text>
            </View>
          )}
        </View>
      </Card>

      {canPay && (
        <Card style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment</Text>
          <Text style={styles.paymentDescription}>
            {paymentStep === 'processing'
              ? 'Creating payment intent...'
              : paymentStep === 'confirming'
              ? 'Processing payment...'
              : 'Accept payment for this invoice using Stripe.'}
          </Text>
          <Button
            title={isProcessing ? 'Processing...' : 'Accept Payment'}
            onPress={handlePayment}
            loading={isProcessing}
            disabled={isProcessing}
          />
        </Card>
      )}

      {invoice.status === 'paid' && (
        <Card style={styles.successCard}>
          <Text style={styles.successText}>✓ Payment Complete</Text>
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  invoiceId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 90,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  paymentCard: {
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paymentDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  successCard: {
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
  },
  successText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.success,
  },
});
