import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenTitle } from '@components/ui/screen-title';
import { ActionBar, Button, ConfirmDeleteSheet, SearchInput, useToast } from '@components/ui';
import { ShoppingList, ListTitleFormSheet, type ShoppingListData } from '@features/shopping-lists';
import { createShoppingList, deleteShoppingList, getAllShoppingLists } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { useDebounce } from '@lib/hooks';
import { generateUUID } from '@lib/uuid';
import { useI18n } from '@lib/i18n';
import { normalizeText } from '@lib/utils';
import { calcListTotalAmount } from '@models/shopping-list.model';
import { useTheme } from '@lib/theme';

type InicioStackParamList = {
  InicioList: undefined;
  ShoppingListDetail: { shoppingListId: string };
};

type InicioNavigationProp = NativeStackNavigationProp<InicioStackParamList, 'InicioList'>;

export default function InicioScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<InicioNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: string; title: string } | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const toast = useToast();

  const isFirstFocus = useRef(true);

  const loadLists = useCallback(async () => {
    try {
      const shoppingLists = await getAllShoppingLists();
      const products = await getAllProducts();
      const mapped = shoppingLists.map((list) => ({
        id: list.id,
        title: list.title,
        itemCount: list.items.length,
        completedCount: list.items.filter((item) => item.done).length,
        totalAmount: calcListTotalAmount(list, products),
      }));
      setLists(mapped);
    } catch (error) {
      console.error("Failed to load shopping lists:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
      }
      loadLists();
    }, [loadLists])
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
    toast.show({ message: t('toast.listCreated'), type: 'success' });
    await loadLists();
    navigation.navigate('ShoppingListDetail', { shoppingListId: newId });
  }

  function openDetail(listId: string) {
    navigation.navigate('ShoppingListDetail', { shoppingListId: listId });
  }

  function handleRemovePress(listId: string) {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    setListToDelete({ id: list.id, title: list.title });
    setIsDeleteSheetOpen(true);
  }

  async function handleConfirmDelete() {
    if (!listToDelete) return;
    await deleteShoppingList(listToDelete.id);
    setIsDeleteSheetOpen(false);
    setListToDelete(null);
    toast.show({ message: t('toast.listDeleted'), type: 'success' });
    loadLists();
  }

  function handleCancelDelete() {
    setIsDeleteSheetOpen(false);
    setListToDelete(null);
  }

  const filteredLists = useMemo(() => {
    if (!debouncedSearch.trim()) return lists;
    const query = normalizeText(debouncedSearch);
    return lists.filter((l) => normalizeText(l.title).includes(query));
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
      <ActionBar>
        <View style={styles.searchRow}>
          <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.lists')} />
          <Button onPress={openCreateSheet} size="icon">
            <Ionicons name="add" size={20} color="#fff" />
          </Button>
        </View>
      </ActionBar>
      {filteredLists.length > 0 ? (
        <ShoppingList data={filteredLists} onListPress={openDetail} onRemoveList={handleRemovePress}>
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>{t('lists.showingCount', { count: filteredLists.length })}</Text>
        </ShoppingList>
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{lists.length > 0 ? t('common.noResults') : t('lists.empty')}</Text>
        </View>
      )}

      <ListTitleFormSheet isOpen={isTitleSheetOpen} onSave={handleCreateList} onClose={closeTitleSheet} />

      <ConfirmDeleteSheet isOpen={isDeleteSheetOpen} onClose={handleCancelDelete} onConfirm={handleConfirmDelete} title={t('lists.deleteModal.title')} message={t('lists.deleteModal.confirmMessage', { list: listToDelete?.title ?? '' })} warning={t('lists.deleteModal.warning')} confirmLabel={t('lists.deleteModal.confirm')} />
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
    gap: 10,
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
  countLabel: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
