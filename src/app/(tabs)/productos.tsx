import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenTitle } from '@components/ui/screen-title';
import { Button, SearchInput } from '@components/ui';
import { ProductList, type ProductListData } from '@features/products';
import { ProductFormScreen } from '@features/products';
import { createProduct, deleteProduct, getAllProducts, updateProduct } from '@lib/repositories/products';
import { getAllStores } from '@lib/repositories/stores';
import { useDebounce } from '@lib/hooks';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Product } from '@models/product.model';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

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

export default function ProductosScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreListData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const debouncedSearch = useDebounce(searchQuery, 300);

  async function loadData() {
    try {
      const [allProducts, allStores] = await Promise.all([getAllProducts(), getAllStores()]);
      setProducts(allProducts);
      setStores(allStores.map((s) => ({ id: s.id, description: s.description })));
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  useEffect(() => {
    async function init() {
      await loadData();
      setIsLoading(false);
    }
    init();
  }, []);

  function openAddForm() {
    setSelectedProduct(undefined);
    setIsFormOpen(true);
  }

  function openEditForm(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsFormOpen(true);
    }
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  const handleSave = useCallback(async (productName: string, unitOfMeasurement: string, prices: Price[]) => {
    await createProduct(generateUUID(), productName, unitOfMeasurement, prices);
    closeForm();
    await loadData();
  }, []);

  const handleUpdate = useCallback(async (id: string, productName: string, unitOfMeasurement: string, prices: Price[]) => {
    await updateProduct(id, productName, unitOfMeasurement, prices);
    closeForm();
    await loadData();
  }, []);

  async function handleDelete(productId: string) {
    await deleteProduct(productId);
    closeForm();
    await loadData();
  }

  const filteredProducts: ProductListData[] = useMemo(() => {
    const mapped = products.map((p) => ({
      id: p.id,
      productName: p.productName,
      unitOfMeasurement: p.unitOfMeasurement,
    }));
    if (!debouncedSearch.trim()) return mapped;
    const query = debouncedSearch.toLowerCase();
    return mapped.filter((p) => p.productName.toLowerCase().includes(query));
  }, [products, debouncedSearch]);

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
      <ProductFormScreen product={selectedProduct} stores={stores} onBack={closeForm} onSave={handleSave} onUpdate={handleUpdate} onDelete={handleDelete} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>{t('tab.products')}</ScreenTitle>
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.products')} />
        <Button onPress={openAddForm}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('products.add')}</Text>
        </Button>
      </View>
      {filteredProducts.length > 0 ? (
        <ProductList data={filteredProducts} onProductPress={openEditForm} />
      ) : searchQuery !== debouncedSearch ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{products.length > 0 ? t('common.noResults') : t('products.empty')}</Text>
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
