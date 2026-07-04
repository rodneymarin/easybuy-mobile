import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenTitle } from '@components/ui/screen-title';
import { Button, SearchInput } from '@components/ui';
import { ShoppingList, type ShoppingListData } from '@features/shopping-lists';
import { getAllShoppingLists } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { calcListTotalAmount } from '@models/shopping-list.model';
import { useTheme } from '@lib/theme';

export default function InicioScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function load() {
      try {
        const shoppingLists = await getAllShoppingLists();
        const products = await getAllProducts();
        const mapped = shoppingLists.map((list) => ({
          id: list.id,
          title: list.title,
          itemCount: list.items.length,
          totalAmount: calcListTotalAmount(list, products),
        }));
        setLists(mapped);
      } catch (error) {
        console.error("Failed to load shopping lists:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredLists = useMemo(() => {
    if (!debouncedSearch.trim()) return lists;
    const query = debouncedSearch.toLowerCase();
    return lists.filter((l) => l.title.toLowerCase().includes(query));
  }, [lists, debouncedSearch]);

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
      <ScreenTitle>{t('tab.lists')}</ScreenTitle>
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.lists')} />
        <Button>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('lists.add')}</Text>
        </Button>
      </View>
      {filteredLists.length > 0 ? (
        <ShoppingList data={filteredLists} />
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{lists.length > 0 ? t('common.noResults') : t('lists.empty')}</Text>
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
