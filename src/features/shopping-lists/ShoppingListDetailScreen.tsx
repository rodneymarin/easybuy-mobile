import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, Button, FadeIn, ScreenTitle, Tag, Toggle } from '@components/ui';
import { ShoppingListCheckCircle, ShoppingListItemCard, ShoppingListItemTitle, ShoppingListTotals, ListTitleFormSheet, ShoppingListItemFormScreen } from '@features/shopping-lists/components';
import { getShoppingListById, getAllShoppingLists, toggleItemDone, removeItemFromList, removeItemsFromList, moveItemsToList, updateShoppingListTitle, addItemToList, updateItemInList } from '@lib/repositories/shopping-lists';
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemRowIds, setSelectedItemRowIds] = useState<Set<number>>(new Set());
  const [isDeleteSelectedSheetOpen, setIsDeleteSelectedSheetOpen] = useState(false);
  const [isMoveSheetOpen, setIsMoveSheetOpen] = useState(false);
  const [availableLists, setAvailableLists] = useState<{ id: string; title: string }[]>([]);
  const [isRemoveCompletedSheetOpen, setIsRemoveCompletedSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        productName: product?.productName ?? t('common.unknown'),
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

  function resetSelection() {
    setIsSelectionMode(false);
    setSelectedItemRowIds(new Set());
    setAvailableLists([]);
  }

  function handleEditPress(item: ItemDisplayData) {
    setEditingItemRowId(item.rowId);
    setIsItemFormOpen(true);
  }

  function handleItemPress(item: ItemDisplayData) {
    if (isSelectionMode) {
      toggleItemSelection(item.rowId);
    } else {
      handleEditPress(item);
    }
  }

  function handleItemLongPress(item: ItemDisplayData) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedItemRowIds(new Set([item.rowId]));
      getAllShoppingLists().then((allLists) => {
        setAvailableLists(allLists.filter((l) => l.id !== shoppingListId));
      }).catch((error) => {
        console.error("Failed to load lists for move:", error);
      });
    }
  }

  function toggleItemSelection(rowId: number) {
    setSelectedItemRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
        if (next.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        next.add(rowId);
      }
      return next;
    });
  }

  function handleMoveSelectedPress() {
    setIsMoveSheetOpen(true);
  }

  async function handleConfirmMoveItems(targetListId: string) {
    const rowIds = Array.from(selectedItemRowIds);
    setIsMoveSheetOpen(false);
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => !rowIds.includes(item.rowId)),
      };
    });
    resetSelection();
    await moveItemsToList(rowIds, targetListId);
  }

  function handleDeleteSelectedPress() {
    setIsDeleteSelectedSheetOpen(true);
  }

  async function handleConfirmDeleteSelected() {
    const rowIds = Array.from(selectedItemRowIds);
    setIsDeleteSelectedSheetOpen(false);
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => !rowIds.includes(item.rowId)),
      };
    });
    resetSelection();
    await removeItemsFromList(rowIds);
  }

  function handleRemoveCompletedPress() {
    setIsRemoveCompletedSheetOpen(true);
  }

  async function handleUncheckAll() {
    const doneItemsList = shoppingList?.items.filter((item) => item.done) ?? [];
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({ ...item, done: false })),
      };
    });
    for (const item of doneItemsList) {
      await toggleItemDone(item.rowId);
    }
  }

  async function handleConfirmRemoveCompleted() {
    const doneRowIds = doneItems.map((item) => item.rowId);
    setIsRemoveCompletedSheetOpen(false);
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => !item.done),
      };
    });
    await removeItemsFromList(doneRowIds);
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
      <ShoppingListItemFormScreen item={editingItem} products={products} stores={stores} onBack={() => { setIsItemFormOpen(false); setEditingItemRowId(null); }} onSave={handleSaveItem} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} />
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
          <ScreenTitle>{t('common.error')}</ScreenTitle>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('listDetail.notFound')}</Text>
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
        <View style={[styles.filterContainer, isSelectionMode && styles.filterContainerMuted]}>
          <Toggle label={t('listDetail.allStores')} isSelected={activeStoreId === null} onPress={() => handleSelectStore(null)} disabled={isSelectionMode} />
          {uniqueStores.map((store) => (
            <Toggle key={store.id} label={store.description} isSelected={activeStoreId === store.id} onPress={() => handleSelectStore(store.id)} disabled={isSelectionMode} />
          ))}
        </View>
      )}

      {isSelectionMode ? (
        <View style={styles.selectionHeader}>
          <Pressable onPress={resetSelection} hitSlop={8} style={styles.selectionBackButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.selectionCount, { color: colors.text }]}>{selectedItemRowIds.size} {t('common.selected')}</Text>
          <View style={styles.selectionActions}>
            {availableLists.length > 0 && (
              <Button onPress={handleMoveSelectedPress}>
                <Text style={[styles.destructiveButtonText, { color: '#fff' }]}>{t('listDetail.moveSelected')}</Text>
              </Button>
            )}
            <Button variant="destructive" style={styles.deleteSelectedButton} onPress={handleDeleteSelectedPress}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')} ({selectedItemRowIds.size})</Text>
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.totalsRow}>
          <View style={styles.totalsFlex}>
            <ShoppingListTotals globalTotal={globalTotal} cartTotal={cartTotal} onAddPress={handleAddPress} />
          </View>
          {doneItems.length > 0 && (
            <Pressable onPress={() => setIsMenuOpen(true)} style={styles.menuButton} hitSlop={8}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {pendingItems.length > 0 && (
          pendingItems.map((item) => (
            <ShoppingListItemCard key={item.rowId} isSelected={selectedItemRowIds.has(item.rowId)} isSelectionMode={isSelectionMode} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)}>
              <View style={styles.itemContent}>
                <ShoppingListItemTitle name={item.productName} isDone={false} />
                <View style={styles.itemTags}>
                  {!activeStoreId && item.storeDescription ? (
                    <Tag size="sm" label={item.storeDescription} />
                  ) : null}
                  <Tag size="sm" label={`${item.quantity} ${item.unitLabel}`} />
                  {item.price * item.quantity > 0 ? (
                    <Tag size="sm" label={`$${(item.price * item.quantity).toFixed(2)}`} />
                  ) : null}
                </View>
              </View>
              <ShoppingListCheckCircle isDone={false} onToggle={() => handleToggleDone(item.rowId)} disabled={isSelectionMode} />
            </ShoppingListItemCard>
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
              <ShoppingListItemCard key={item.rowId} isSelected={selectedItemRowIds.has(item.rowId)} isSelectionMode={isSelectionMode} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)}>
                <View style={styles.itemContent}>
                  <ShoppingListItemTitle name={item.productName} isDone={true} />
                  <View style={styles.itemTags}>
                    {!activeStoreId && item.storeDescription ? (
                      <Tag size="sm" label={item.storeDescription} />
                    ) : null}
                    <Tag size="sm" label={`${item.quantity} ${item.unitLabel}`} />
                    {item.price * item.quantity > 0 ? (
                      <Tag size="sm" label={`$${(item.price * item.quantity).toFixed(2)}`} />
                    ) : null}
                  </View>
                </View>
                <ShoppingListCheckCircle isDone={true} onToggle={() => handleToggleDone(item.rowId)} disabled={isSelectionMode} />
              </ShoppingListItemCard>
            ))}
          </View>
        )}
      </ScrollView>

      <ListTitleFormSheet isOpen={isTitleSheetOpen} initialTitle={shoppingList.title} onSave={handleSaveTitle} onClose={() => setIsTitleSheetOpen(false)} />

      <RNModal visible={isMenuOpen} transparent animationType="none" onRequestClose={() => setIsMenuOpen(false)}>
        <FadeIn style={styles.menuBackdrop}><Pressable style={styles.menuBackdropInner} onPress={() => setIsMenuOpen(false)}>
          <View style={[styles.menuCard, { backgroundColor: colors.cardBackground }]}>
            <Pressable style={styles.menuItem} onPress={() => { setIsMenuOpen(false); handleUncheckAll(); }}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t('listDetail.menuUncheckAll')}</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { setIsMenuOpen(false); handleRemoveCompletedPress(); }}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t('listDetail.removeCompleted')}</Text>
            </Pressable>
          </View>
        </Pressable>
        </FadeIn>
      </RNModal>

      <BottomSheet isOpen={isRemoveCompletedSheetOpen} onClose={() => setIsRemoveCompletedSheetOpen(false)}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('listDetail.removeCompleted')}</Text>
        <Text style={[styles.sheetMessage, { color: colors.textSecondary }]}>
          {t('listDetail.removeCompletedConfirmMessage')}
        </Text>
        <View style={styles.sheetActions}>
          <Pressable onPress={handleConfirmRemoveCompleted} style={[styles.sheetButton, { backgroundColor: colors.destructive }]}>
            <Text style={[styles.sheetButtonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')}</Text>
          </Pressable>
          <Pressable onPress={() => setIsRemoveCompletedSheetOpen(false)} style={[styles.sheetButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetButtonText, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet isOpen={isMoveSheetOpen} onClose={() => setIsMoveSheetOpen(false)}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('listDetail.moveSelectedTitle')}</Text>
        {availableLists.length === 0 ? (
          <Text style={[styles.sheetMessage, { color: colors.textSecondary }]}>{t('listDetail.moveNoLists')}</Text>
        ) : (
          <View style={styles.moveListContainer}>
            {availableLists.map((list) => (
              <Pressable key={list.id} style={[styles.moveListItem, { borderColor: colors.border }]} onPress={() => handleConfirmMoveItems(list.id)}>
                <Text style={[styles.moveListItemText, { color: colors.text }]}>{list.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}
      </BottomSheet>

      <BottomSheet isOpen={isDeleteSelectedSheetOpen} onClose={() => setIsDeleteSelectedSheetOpen(false)}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('listDetail.confirmDeleteSelected')}</Text>
        <Text style={[styles.sheetMessage, { color: colors.textSecondary }]}>
          {t('listDetail.confirmDeleteSelectedMessage', { count: selectedItemRowIds.size })}
        </Text>
        <Pressable onPress={handleConfirmDeleteSelected} style={[styles.sheetButton, { backgroundColor: colors.destructive }]}>
          <Text style={[styles.sheetButtonText, { color: colors.destructiveBorder }]}>{t('listDetail.removeConfirm')}</Text>
        </Pressable>
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
  filterContainerMuted: {
    opacity: 0.5,
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
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTags: {
    flexDirection: 'row',
    gap: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalsFlex: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 100,
    alignItems: 'flex-end',
    paddingRight: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuBackdropInner: {
    flex: 1,
  },
  menuCard: {
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteSelectedButton: {
    paddingHorizontal: 12,
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  moveListContainer: {
    gap: 4,
  },
  moveListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
  },
  moveListItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
