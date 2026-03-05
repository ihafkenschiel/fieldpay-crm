import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput, ScreenContainer, Card, colors, spacing, fontSize } from '@fieldpay/ui';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/stores/auth.store';
import { useDiagnosticsStore } from '../../src/stores/diagnostics.store';
import { EventNames } from '@fieldpay/core';

export default function LoginScreen() {
  const [username, setUsername] = useState('demo@fieldpay.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);
  const logEvent = useDiagnosticsStore((s) => s.logEvent);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.auth.login({ username, password });
      await setAuth(result.tokens, result.user);
      logEvent(EventNames.AUTH_SUCCESS, { userId: result.user.id });
      router.replace('/(app)/accounts');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      logEvent(EventNames.AUTH_FAILURE, { error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Pay CRM</Text>
        <Text style={styles.subtitle}>Enterprise Sales & Payments</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <TextInput
          label="Email"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <Text style={styles.hint}>
          Demo credentials: demo@fieldpay.com / demo123
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
