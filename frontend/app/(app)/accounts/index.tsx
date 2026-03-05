import { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { TextInput, ListItem, EmptyState, colors, spacing } from '@fieldpay/ui';
import { useAccounts } from '../../../src/hooks/useAccounts';

export default function AccountsScreen() {
  const [search, setSearch] = useState('');
  const { data: accounts, isLoading, refetch } = useAccounts(search || undefined);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search accounts..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={item.industry}
            onPress={() => router.push(`/(app)/accounts/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No accounts found"
              message={search ? 'Try a different search term' : 'Pull to refresh'}
            />
          ) : null
        }
        contentContainerStyle={accounts?.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: 0,
  },
  emptyList: {
    flex: 1,
  },
});
