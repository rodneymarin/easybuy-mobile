import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, ScreenTitle, Toggle } from '@components/ui';
import { ShoppingListItemCard, ShoppingListTotals, ListTitleFormSheet, ShoppingListItemFormScreen } from '@features/shopping-lists/components';
import { getShoppingListById, toggleItemDone, removeItemFromList, updateShoppingListTitle, addItemToList, updateItemInList } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { getAllStores } from '@lib/repositories/stores';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { ShoppingList } from '@models/shopping-list.model';
import type { Product } from '@models/product.model';
import type { Store } from '@models/store.model';

interface ItemDisplayData {
  rowId: number;
  productName: string;
  quantity: number;
  unitLabel: string;
  storeId?: string;
  storeDescription?: string;
  price: number;
  isDone: boolean;
}

interface ShoppingListDetailScreenProps {
  shoppingListId: string;
  onBack: () => void;
}

export default function ShoppingListDetailScreen({ shoppingListId, onBack }: ShoppingListDetailScreenProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [isRemoveSheetOpen, setIsRemoveSheetOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<ItemDisplayData | null>(null);
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItemRowId, setEditingItemRowId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [list, allProducts, allStores] = await Promise.all([
        getShoppingListById(shoppingListId),
        getAllProducts(),
        getAllStores(),
      ]);
      setShoppingList(list);
      setProducts(allProducts);
      setStores(allStores);
    } catch (error) {
      console.error("Failed to load shopping list detail:", error);
    } finally {
      setIsLoading(false);
    }
  }, [shoppingListId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const storeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const store of stores) {
      map.set(store.id, store.description);
    }
    return map;
  }, [stores]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) {
      map.set(product.id, product);
    }
    return map;
  }, [products]);

  const items: ItemDisplayData[] = useMemo(() => {
    if (!shoppingList) return [];
    return shoppingList.items.map((item) => {
      const product = productMap.get(item.productId);
      const storeDesc = item.storeId ? storeMap.get(item.storeId) : undefined;
      const price = product?.prices?.find((p) => p.storeId === item.storeId)?.value ?? 0;
      const unitLabel = (() => {
        if (!product) return '';
        const label = t(`unit.${product.unitOfMeasurement}`);
        return label !== `unit.${product.unitOfMeasurement}` ? label : product.unitOfMeasurement;
      })();
      return {
        rowId: item.rowId,
        productName: product?.productName ?? 'Unknown',
        quantity: item.quantity,
        unitLabel,
        storeId: item.storeId,
        storeDescription: storeDesc,
        price,
        isDone: item.done ?? false,
      };
    });
  }, [shoppingList, productMap, storeMap, t]);

  const hasStorelessItems = useMemo(() => items.some((item) => !item.storeId), [items]);
  const hasStoredItems = useMemo(() => items.some((item) => item.storeId), [items]);

  const uniqueStores = useMemo(() => {
    const storeIds = new Set<string>();
    for (const item of items) {
      if (item.storeId) storeIds.add(item.storeId);
    }
    return stores.filter((s) => storeIds.has(s.id));
  }, [items, stores]);

  const shouldShowFilters = uniqueStores.length > 1 || (hasStorelessItems && hasStoredItems);

  const filteredItems = useMemo(() => {
    if (!activeStoreId) return items;
    return items.filter((item) => item.storeId === activeStoreId);
  }, [items, activeStoreId]);

  const pendingItems = useMemo(() => filteredItems.filter((item) => !item.isDone), [filteredItems]);
  const doneItems = useMemo(() => filteredItems.filter((item) => item.isDone), [filteredItems]);

  const globalTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.filter((item) => item.isDone).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  function handleSelectStore(storeId: string | null) {
    setActiveStoreId(storeId);
  }

  async function handleToggleDone(rowId: number) {
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.rowId === rowId ? { ...item, done: !item.done } : item
        ),
      };
    });
    try {
      await toggleItemDone(rowId);
    } catch (error) {
      console.error("Failed to toggle item done:", error);
    }
  }

  function handleTitlePress() {
    setIsTitleSheetOpen(true);
  }

  async function handleSaveTitle(title: string) {
    await updateShoppingListTitle(shoppingListId, title);
    setShoppingList((prev) => prev ? { ...prev, title } : prev);
    setIsTitleSheetOpen(false);
  }

  function handleEditPress(item: ItemDisplayData) {
    setEditingItemRowId(item.rowId);
    setIsItemFormOpen(true);
  }

  function handleRemovePress(item: ItemDisplayData) {
    setItemToRemove(item);
    setIsRemoveSheetOpen(true);
  }

  async function handleConfirmRemove() {
    if (!itemToRemove) return;
    const rowId = itemToRemove.rowId;
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.rowId !== rowId),
      };
    });
    setIsRemoveSheetOpen(false);
    setItemToRemove(null);
    try {
      await removeItemFromList(rowId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  }

  function handleAddPress() {
    setEditingItemRowId(null);
    setIsItemFormOpen(true);
  }

  async function handleSaveItem(productId: string, quantity: number, storeId?: string) {
    try {
      await addItemToList(shoppingListId, { productId, quantity, storeId });
      await loadData();
      setIsItemFormOpen(false);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  }

  async function handleUpdateItem(rowId: number, productId: string, quantity: number, storeId?: string) {
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.rowId === rowId ? { ...item, productId, quantity, storeId } : item
        ),
      };
    });
    setIsItemFormOpen(false);
    setEditingItemRowId(null);
    try {
      await updateItemInList(rowId, productId, quantity, storeId);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  }

  async function handleDeleteItem(rowId: number) {
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.rowId !== rowId),
      };
    });
    setIsItemFormOpen(false);
    setEditingItemRowId(null);
    try {
      await removeItemFromList(rowId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  }

  const editingItem = useMemo(() => {
    if (editingItemRowId === null || !shoppingList) return undefined;
    const item = shoppingList.items.find((i) => i.rowId === editingItemRowId);
    if (!item) return undefined;
    return { rowId: item.rowId, productId: item.productId, quantity: item.quantity, storeId: item.storeId };
  }, [editingItemRowId, shoppingList]);

  if (isItemFormOpen) {
    return (
      <ShoppingListItemFormScreen
        item={editingItem}
        products={products}
        stores={stores}
        onBack={() => { setIsItemFormOpen(false); setEditingItemRowId(null); }}
        onSave={handleSaveItem}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerWrapper}>
          <ScreenTitle>{t('common.loading')}</ScreenTitle>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ActivityIndicator size="large" color={colors.text} style={styles.loader} />
      </View>
    );
  }

  if (!shoppingList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerWrapper}>
          <ScreenTitle>Error</ScreenTitle>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>List not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerWrapper}>
        <Pressable onPress={handleTitlePress}>
          <ScreenTitle>{shoppingList.title}</ScreenTitle>
        </Pressable>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      {shouldShowFilters && (
        <View style={styles.filterContainer}>
          <Toggle label={t('listDetail.allStores')} isSelected={activeStoreId === null} onPress={() => handleSelectStore(null)} />
          {uniqueStores.map((store) => (
            <Toggle key={store.id} label={store.description} isSelected={activeStoreId === store.id} onPress={() => handleSelectStore(store.id)} />
          ))}
        </View>
      )}

      <ShoppingListTotals globalTotal={globalTotal} cartTotal={cartTotal} onAddPress={handleAddPress} />

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {pendingItems.length > 0 && (
          pendingItems.map((item) => (
            <ShoppingListItemCard
              key={item.rowId}
              productName={item.productName}
              quantity={item.quantity}
              unitLabel={item.unitLabel}
              totalPrice={item.price * item.quantity}
              storeDescription={item.storeDescription}
              isDone={false}
              isFilteredByStore={activeStoreId !== null}
              onToggleDone={() => handleToggleDone(item.rowId)}
              onRemove={() => handleRemovePress(item)}
              onEditPress={() => handleEditPress(item)}
            />
          ))
        )}

        {items.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('listDetail.empty')}</Text>
        )}
        {items.length > 0 && filteredItems.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('listDetail.noFilterMatch')}</Text>
        )}

        {doneItems.length > 0 && (
          <View style={styles.doneSection}>
            <Text style={[styles.doneSectionTitle, { color: colors.textSecondary }]}>{t('listDetail.doneSection')}</Text>
            <View style={[styles.doneDivider, { backgroundColor: colors.border }]} />
            {doneItems.map((item) => (
              <ShoppingListItemCard
                key={item.rowId}
                productName={item.productName}
                quantity={item.quantity}
                unitLabel={item.unitLabel}
                totalPrice={item.price * item.quantity}
                storeDescription={item.storeDescription}
                isDone={true}
                isFilteredByStore={activeStoreId !== null}
                onToggleDone={() => handleToggleDone(item.rowId)}
                onRemove={() => handleRemovePress(item)}
                onEditPress={() => handleEditPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ListTitleFormSheet
        isOpen={isTitleSheetOpen}
        initialTitle={shoppingList.title}
        onSave={handleSaveTitle}
        onClose={() => setIsTitleSheetOpen(false)}
      />

      <BottomSheet isOpen={isRemoveSheetOpen} onClose={() => setIsRemoveSheetOpen(false)}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('listDetail.removeTitle')}</Text>
        <Text style={[styles.sheetMessage, { color: colors.textSecondary }]}>
          {t('listDetail.removeMessage', { product: itemToRemove?.productName ?? '' })}
        </Text>
        <View style={styles.sheetActions}>
          <Pressable
            onPress={handleConfirmRemove}
            style={[styles.sheetButton, { backgroundColor: colors.destructive }]}>
            <Text style={[styles.sheetButtonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsRemoveSheetOpen(false)}
            style={[styles.sheetButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetButtonText, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
          </Pressable>
        </View>
      </BottomSheet>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerWrapper: {
    position: 'relative',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 8,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  doneSection: {
    marginTop: 8,
  },
  doneSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  doneDivider: {
    height: 1,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sheetMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetActions: {
    gap: 8,
  },
  sheetButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
