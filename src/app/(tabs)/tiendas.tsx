import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenTitle } from '@components/ui/screen-title';
import { ActionBar, Button, ConfirmDeleteSheet, SearchInput, useToast } from '@components/ui';
import { StoreList, type StoreListData } from '@features/stores';
import { deleteStores, getAllStores } from '@lib/repositories/stores';
import { useDebounce, useSelectionMode } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { normalizeText } from '@lib/utils';
import { useTheme } from '@lib/theme';
import { useDataSource } from '@lib/data-source';
import { generateUUID } from '@lib/uuid';
import type { StoresStackParamList } from '../navigation';

type TiendasNavigationProp = NativeStackNavigationProp<StoresStackParamList, 'StoreList'>;

export default function TiendasScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<TiendasNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isSelectionMode, setIsSelectionMode, selectedIds: selectedStoreIds, setSelectedIds: setSelectedStoreIds, resetSelection, toggleSelection, handlePress, exitSelectionMode } = useSelectionMode();
  const [isDeleteSelectedSheetOpen, setIsDeleteSelectedSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const toast = useToast();
  const { refreshVersion } = useDataSource();

  const isFirstFocus = useRef(true);

  const loadStores = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const allStores = await getAllStores();
      const mapped = allStores.map((s) => ({
        id: s.id,
        description: s.description,
        color: s.color,
      }));
      setStores(mapped);
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [refreshVersion]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        loadStores(true);
        return;
      }
      loadStores();
    }, [loadStores])
  );

  function openAddForm() {
    navigation.navigate('StoreForm', { store: undefined });
  }

  function openEditForm(storeId: string) {
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      navigation.navigate('StoreForm', { store: { id: store.id, description: store.description, color: store.color } });
    }
  }

  function handleStorePress(storeId: string) {
    handlePress(storeId, openEditForm);
  }

  function handleStoreLongPress(storeId: string) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedStoreIds(new Set([storeId]));
    }
  }

  function handleDeleteSelectedPress() {
    setIsDeleteSelectedSheetOpen(true);
  }

  async function handleConfirmDeleteSelected() {
    const ids = Array.from(selectedStoreIds);
    setIsDeleteSelectedSheetOpen(false);
    resetSelection();
    await deleteStores(ids);
    toast.show({ message: t('toast.storesDeleted'), type: 'success' });
    await loadStores();
  }

  const filteredStores = useMemo(() => {
    if (!debouncedSearch.trim()) return stores;
    const query = normalizeText(debouncedSearch);
    return stores.filter((s) => normalizeText(s.description).includes(query));
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
      <ActionBar>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <Pressable onPress={exitSelectionMode} hitSlop={8} style={styles.selectionBackButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.selectionCount, { color: colors.text }]}>{selectedStoreIds.size} {t('common.selected')}</Text>
            <Button variant="destructive" style={styles.deleteSelectedButton} onPress={handleDeleteSelectedPress}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.deleteSelected.confirm')} ({selectedStoreIds.size})</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.searchRow}>
            <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.stores')} />
            <Button onPress={openAddForm} size="icon">
              <Ionicons name="add" size={20} color="#fff" />
            </Button>
          </View>
        )}
      </ActionBar>
      {filteredStores.length > 0 ? (
        <StoreList data={filteredStores} selectedIds={selectedStoreIds} isSelectionMode={isSelectionMode} onStorePress={handleStorePress} onStoreLongPress={handleStoreLongPress}>
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>{t('stores.showingCount', { count: filteredStores.length })}</Text>
        </StoreList>
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{stores.length > 0 ? t('common.noResults') : t('stores.empty')}</Text>
        </View>
      )}

      <ConfirmDeleteSheet isOpen={isDeleteSelectedSheetOpen} onClose={() => setIsDeleteSelectedSheetOpen(false)} onConfirm={handleConfirmDeleteSelected} title={t('stores.deleteSelected.title')} message={t('stores.deleteSelected.confirmMessage', { count: selectedStoreIds.size })} warning={t('stores.deleteSelected.warning')} confirmLabel={t('stores.deleteSelected.confirm')} />
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
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCount: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteSelectedButton: {
    paddingHorizontal: 12,
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countLabel: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
