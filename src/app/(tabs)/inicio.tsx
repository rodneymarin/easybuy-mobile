import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenTitle } from '@components/ui/screen-title';
import { Button, SearchInput } from '@components/ui';
import { ShoppingList, ShoppingListDetailScreen, ListTitleFormSheet, type ShoppingListData } from '@features/shopping-lists';
import { createShoppingList, getAllShoppingLists } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { calcListTotalAmount } from '@models/shopping-list.model';
import { useTheme } from '@lib/theme';

function generateUUID(): string {
  let d = new Date().getTime();
  let d2 = 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function InicioScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  async function loadLists() {
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

  useEffect(() => {
    loadLists();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsDetailOpen(false);
        setSelectedListId(null);
      };
    }, [])
  );

  function openCreateSheet() {
    setIsTitleSheetOpen(true);
  }

  function closeTitleSheet() {
    setIsTitleSheetOpen(false);
  }

  async function handleCreateList(title: string) {
    const newId = generateUUID();
    await createShoppingList(newId, title);
    closeTitleSheet();
    await loadLists();
    setSelectedListId(newId);
    setIsDetailOpen(true);
  }

  function openDetail(listId: string) {
    setSelectedListId(listId);
    setIsDetailOpen(true);
  }

  function closeDetail() {
    setIsDetailOpen(false);
    setSelectedListId(null);
    loadLists();
  }

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

  if (isDetailOpen && selectedListId) {
    return <ShoppingListDetailScreen shoppingListId={selectedListId} onBack={closeDetail} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>{t('tab.lists')}</ScreenTitle>
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.lists')} />
        <Button onPress={openCreateSheet}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('lists.add')}</Text>
        </Button>
      </View>
      {filteredLists.length > 0 ? (
        <ShoppingList data={filteredLists} onListPress={openDetail} />
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{lists.length > 0 ? t('common.noResults') : t('lists.empty')}</Text>
        </View>
      )}

      <ListTitleFormSheet
        isOpen={isTitleSheetOpen}
        onSave={handleCreateList}
        onClose={closeTitleSheet}
      />
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
