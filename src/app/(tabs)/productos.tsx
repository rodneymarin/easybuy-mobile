import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenTitle } from '@components/ui/screen-title';
import { ActionBar, Button, ConfirmDeleteSheet, SearchInput, useToast } from '@components/ui';
import { ProductList, type ProductListData } from '@features/products';
import { deleteProducts, getAllProducts } from '@lib/repositories/products';
import { getAllStores } from '@lib/repositories/stores';
import { useDebounce, useSelectionMode } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { normalizeText } from '@lib/utils';
import { useTheme } from '@lib/theme';
import { generateUUID } from '@lib/uuid';
import type { Product } from '@models/product.model';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';
import type { ProductsStackParamList } from '../navigation';

type ProductosNavigationProp = NativeStackNavigationProp<ProductsStackParamList, 'ProductList'>;

export default function ProductosScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<ProductosNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isSelectionMode, setIsSelectionMode, selectedIds: selectedProductIds, setSelectedIds: setSelectedProductIds, resetSelection, toggleSelection, handlePress, exitSelectionMode } = useSelectionMode();
  const [isDeleteSelectedSheetOpen, setIsDeleteSelectedSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const toast = useToast();

  const isFirstFocus = useRef(true);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [allProducts, allStores] = await Promise.all([getAllProducts(), getAllStores()]);
      setProducts(allProducts);
      setStores(allStores.map((s) => ({ id: s.id, description: s.description, color: s.color })));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        loadData(true);
        return;
      }
      loadData();
    }, [loadData])
  );

  function openAddForm() {
    navigation.navigate('ProductForm', { product: undefined, stores });
  }

  function openEditForm(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      navigation.navigate('ProductForm', { product, stores });
    }
  }

  function handleProductPress(productId: string) {
    handlePress(productId, openEditForm);
  }

  function handleProductLongPress(productId: string) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedProductIds(new Set([productId]));
    }
  }

  function handleDeleteSelectedPress() {
    setIsDeleteSelectedSheetOpen(true);
  }

  async function handleConfirmDeleteSelected() {
    const ids = Array.from(selectedProductIds);
    setIsDeleteSelectedSheetOpen(false);
    setIsSelectionMode(false);
    setSelectedProductIds(new Set());
    await deleteProducts(ids);
    toast.show({ message: t('toast.productsDeleted'), type: 'success' });
    await loadData();
  }

  const filteredProducts: ProductListData[] = useMemo(() => {
    const mapped = products.map((p) => ({
      id: p.id,
      productName: p.productName,
      unitOfMeasurement: p.unitOfMeasurement,
    }));
    if (!debouncedSearch.trim()) return mapped;
    const query = normalizeText(debouncedSearch);
    return mapped.filter((p) => normalizeText(p.productName).includes(query));
  }, [products, debouncedSearch]);

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
      <ScreenTitle>{t('tab.products')}</ScreenTitle>
      <ActionBar>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <Pressable onPress={exitSelectionMode} hitSlop={8} style={styles.selectionBackButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.selectionCount, { color: colors.text }]}>{selectedProductIds.size} {t('common.selected')}</Text>
            <Button variant="destructive" style={styles.deleteSelectedButton} onPress={handleDeleteSelectedPress}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.deleteSelected.confirm')} ({selectedProductIds.size})</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.searchRow}>
            <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.products')} />
            <Button onPress={openAddForm} size="icon">
              <Ionicons name="add" size={20} color="#fff" />
            </Button>
          </View>
        )}
      </ActionBar>
      {filteredProducts.length > 0 ? (
        <>
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>{t('products.showingCount', { count: filteredProducts.length })}</Text>
          <ProductList data={filteredProducts} selectedIds={selectedProductIds} isSelectionMode={isSelectionMode} onProductPress={handleProductPress} onProductLongPress={handleProductLongPress} />
        </>
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{products.length > 0 ? t('common.noResults') : t('products.empty')}</Text>
        </View>
      )}

      <ConfirmDeleteSheet isOpen={isDeleteSelectedSheetOpen} onClose={() => setIsDeleteSelectedSheetOpen(false)} onConfirm={handleConfirmDeleteSelected} title={t('products.deleteSelected.title')} message={t('products.deleteSelected.confirmMessage', { count: selectedProductIds.size })} warning={t('products.deleteSelected.warning')} confirmLabel={t('products.deleteSelected.confirm')} />
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
