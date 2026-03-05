import { Tabs } from 'expo-router';
import { colors } from '@fieldpay/ui';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="accounts/index"
        options={{
          title: 'Accounts',
          tabBarLabel: 'Accounts',
        }}
      />
      <Tabs.Screen
        name="accounts/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="invoices/index"
        options={{
          title: 'Invoices',
          tabBarLabel: 'Invoices',
        }}
      />
      <Tabs.Screen
        name="invoices/create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="invoices/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diagnostics"
        options={{
          title: 'Diagnostics',
          tabBarLabel: 'Diagnostics',
        }}
      />
    </Tabs>
  );
}
