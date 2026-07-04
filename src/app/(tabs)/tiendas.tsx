import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';
import { Button, SearchInput } from '@components/ui';
import { StoreList, type StoreListData } from '@features/stores';
import { getAllStores } from '@lib/repositories/stores';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

export default function TiendasScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function load() {
      try {
        const allStores = await getAllStores();
        const mapped = allStores.map((s) => ({
          id: s.id,
          description: s.description,
        }));
        setStores(mapped);
      } catch (error) {
        console.error("Failed to load stores:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredStores = useMemo(() => {
    if (!debouncedSearch.trim()) return stores;
    const query = debouncedSearch.toLowerCase();
    return stores.filter((s) => s.description.toLowerCase().includes(query));
  }, [stores, debouncedSearch]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>{t('tab.stores')}</ScreenTitle>
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.stores')} />
        <Button>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('stores.add')}</Text>
        </Button>
      </View>
      {filteredStores.length > 0 ? (
        <StoreList data={filteredStores} />
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{stores.length > 0 ? t('common.noResults') : t('stores.empty')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 10,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 22,
  },
  addButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
