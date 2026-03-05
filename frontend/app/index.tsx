import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/auth.store';
import { colors } from '@fieldpay/ui';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/accounts" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
