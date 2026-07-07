import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenTitle } from '@components/ui/screen-title';
import { BottomSheet, Button, SearchInput } from '@components/ui';
import { StoreList, type StoreListData } from '@features/stores';
import { createStore, deleteStore, deleteStores, getAllStores, updateStore } from '@lib/repositories/stores';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { StoresStackParamList } from '../navigation';

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

type TiendasNavigationProp = NativeStackNavigationProp<StoresStackParamList, 'StoreList'>;

export default function TiendasScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<TiendasNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isDeleteSelectedSheetOpen, setIsDeleteSelectedSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isFirstFocus = useRef(true);

  const loadStores = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
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
      if (isInitial) setIsLoading(false);
    }
  }, []);

  function resetSelection() {
    setIsSelectionMode(false);
    setSelectedStoreIds(new Set());
  }

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
      navigation.navigate('StoreForm', { store });
    }
  }

  async function handleDeleteStore(storeId: string) {
    await deleteStore(storeId);
    await loadStores();
  }

  function handleStorePress(storeId: string) {
    if (isSelectionMode) {
      toggleStoreSelection(storeId);
    } else {
      openEditForm(storeId);
    }
  }

  function handleStoreLongPress(storeId: string) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedStoreIds(new Set([storeId]));
    }
  }

  function toggleStoreSelection(storeId: string) {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
        if (next.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        next.add(storeId);
      }
      return next;
    });
  }

  function handleExitSelectionMode() {
    resetSelection();
  }

  function handleDeleteSelectedPress() {
    setIsDeleteSelectedSheetOpen(true);
  }

  async function handleConfirmDeleteSelected() {
    const ids = Array.from(selectedStoreIds);
    setIsDeleteSelectedSheetOpen(false);
    resetSelection();
    await deleteStores(ids);
    await loadStores();
  }

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
      {isSelectionMode ? (
        <View style={styles.selectionHeader}>
          <Pressable onPress={handleExitSelectionMode} hitSlop={8} style={styles.selectionBackButton}>
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
          <Button onPress={openAddForm}>
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>{t('stores.add')}</Text>
          </Button>
        </View>
      )}
      {filteredStores.length > 0 ? (
        <StoreList data={filteredStores} selectedIds={selectedStoreIds} isSelectionMode={isSelectionMode} onStorePress={handleStorePress} onStoreLongPress={handleStoreLongPress} />
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{stores.length > 0 ? t('common.noResults') : t('stores.empty')}</Text>
        </View>
      )}

      <BottomSheet isOpen={isDeleteSelectedSheetOpen} onClose={() => setIsDeleteSelectedSheetOpen(false)}>
        <Text style={[styles.deleteSheetTitle, { color: colors.text }]}>{t('stores.deleteSelected.title')}</Text>
        <Text style={[styles.deleteSheetMessage, { color: colors.textSecondary }]}>
          {t('stores.deleteSelected.confirmMessage', { count: selectedStoreIds.size })}
        </Text>
        <Text style={[styles.deleteSheetWarning, { color: colors.textSecondary }]}>{t('stores.deleteSelected.warning')}</Text>
        <Button variant="destructive" style={styles.deleteSheetButton} onPress={handleConfirmDeleteSelected}>
          <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('stores.deleteSelected.confirm')}</Text>
        </Button>
      </BottomSheet>
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
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  deleteSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteSheetMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteSheetWarning: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  deleteSheetButton: {
    justifyContent: 'center',
  },
});
