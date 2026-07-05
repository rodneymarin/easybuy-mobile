import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenTitle } from '@components/ui/screen-title';
import { Button, SearchInput } from '@components/ui';
import { StoreList, StoreFormScreen, type StoreListData } from '@features/stores';
import { createStore, deleteStore, getAllStores, updateStore } from '@lib/repositories/stores';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
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

export default function TiendasScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreListData | undefined>(undefined);
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

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        loadStores(true);
        return () => {
          setIsFormOpen(false);
          setSelectedStore(undefined);
        };
      }
      loadStores();
      return () => {
        setIsFormOpen(false);
        setSelectedStore(undefined);
      };
    }, [loadStores])
  );

  function openAddForm() {
    setSelectedStore(undefined);
    setIsFormOpen(true);
  }

  function openEditForm(storeId: string) {
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      setSelectedStore(store);
      setIsFormOpen(true);
    }
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  const handleAddStore = useCallback(async (description: string) => {
    await createStore(generateUUID(), description);
    closeForm();
    await loadStores();
  }, []);

  const handleUpdateStore = useCallback(async (id: string, description: string) => {
    await updateStore(id, description);
    closeForm();
    await loadStores();
  }, []);

  async function handleDeleteStore(storeId: string) {
    await deleteStore(storeId);
    closeForm();
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

  if (isFormOpen) {
    return (
      <StoreFormScreen store={selectedStore} onBack={closeForm} onSave={handleAddStore} onUpdate={handleUpdateStore} onDelete={handleDeleteStore} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>{t('tab.stores')}</ScreenTitle>
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.stores')} />
        <Button onPress={openAddForm}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('stores.add')}</Text>
        </Button>
      </View>
      {filteredStores.length > 0 ? (
        <StoreList data={filteredStores} onStorePress={openEditForm} />
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
