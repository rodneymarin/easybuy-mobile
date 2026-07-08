import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheet, Button, Dialog, DialogContent, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, ScreenTitle, Tag, Toggle, useToast } from '@components/ui';
import { ShoppingListCheckCircle, ShoppingListItemCard, ShoppingListItemTitle, ShoppingListTotals, ListTitleFormSheet } from '@features/shopping-lists/components';
import { getShoppingListById, getAllShoppingLists, toggleItemDone, removeItemsFromList, moveItemsToList, updateShoppingListTitle } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { getAllStores } from '@lib/repositories/stores';
import { tUnit, useI18n } from '@lib/i18n';
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
  storeColor?: number;
  price: number;
  isDone: boolean;
}

type ListsNavigationParamList = {
  ShoppingListItemForm: { item?: { rowId: number; productId: string; quantity: number; storeId?: string }; shoppingListId: string; products: Product[]; stores: Store[] };
};

type DetailNavigationProp = NativeStackNavigationProp<ListsNavigationParamList>;

export default function ShoppingListDetailScreen() {
  const route = useRoute<{ key: string; name: string; params: { shoppingListId: string } }>();
  const navigation = useNavigation<DetailNavigationProp>();
  const { shoppingListId } = route.params;
  const { colors, isDark } = useTheme();
  const noStoreColor = isDark ? colors.placeholderText : colors.textSecondary;
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
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const toast = useToast();

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

  const storeColorMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const store of stores) {
      map.set(store.id, store.color);
    }
    return map;
  }, [stores]);

  const items: ItemDisplayData[] = useMemo(() => {
    if (!shoppingList) return [];
    return shoppingList.items.map((item) => {
      const product = productMap.get(item.productId);
      const storeDesc = item.storeId ? storeMap.get(item.storeId) : undefined;
      const price = product?.prices?.find((p) => p.storeId === item.storeId)?.value ?? 0;
      const unitLabel = !product ? '' : tUnit(t, product.unitOfMeasurement);
      return {
        rowId: item.rowId,
        productName: product?.productName ?? t('common.unknown'),
        quantity: item.quantity,
        unitLabel,
        storeId: item.storeId,
        storeDescription: storeDesc,
        storeColor: item.storeId ? storeColorMap.get(item.storeId) : undefined,
        price,
        isDone: item.done ?? false,
      };
    });
  }, [shoppingList, productMap, storeMap, storeColorMap, t]);

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

  const [filterBarWidth, setFilterBarWidth] = useState(0);
  const [isMoreFilterOpen, setIsMoreFilterOpen] = useState(false);

  const EST_CHAR_WIDTH = 8.5;
  const MORE_TOGGLE_WIDTH = 40;

  const sortedStores = useMemo(() => {
    return [...uniqueStores].sort((a, b) => a.description.localeCompare(b.description));
  }, [uniqueStores]);

  const { visibleStores, hiddenStores } = useMemo(() => {
    if (!filterBarWidth || sortedStores.length === 0) {
      return { visibleStores: sortedStores, hiddenStores: [] as typeof sortedStores };
    }
    const allLabel = t('listDetail.allStores');
    const allWidth = 28 + allLabel.length * EST_CHAR_WIDTH;
    let remaining = filterBarWidth - 16 - allWidth - 6;
    const visible: typeof sortedStores = [];
    const hidden: typeof sortedStores = [];

    for (const store of sortedStores) {
      const w = 28 + store.description.length * EST_CHAR_WIDTH;
      if (w + MORE_TOGGLE_WIDTH + 6 <= remaining) {
        visible.push(store);
        remaining -= w + 6;
      } else {
        hidden.push(store);
      }
    }

    if (activeStoreId && hidden.some((s) => s.id === activeStoreId)) {
      const promoted = hidden.find((s) => s.id === activeStoreId)!;
      const newHidden = hidden.filter((s) => s.id !== activeStoreId);
      const promotedWidth = 28 + promoted.description.length * EST_CHAR_WIDTH;

      let visRemaining = filterBarWidth - 16 - allWidth - 6 - promotedWidth - 6;
      const wouldFit: typeof sortedStores = [promoted];
      for (const s of visible) {
        const w = 28 + s.description.length * EST_CHAR_WIDTH;
        if (w + MORE_TOGGLE_WIDTH + 6 <= visRemaining) {
          wouldFit.push(s);
          visRemaining -= w + 6;
        } else {
          newHidden.push(s);
        }
      }
      return { visibleStores: wouldFit, hiddenStores: newHidden };
    }

    return { visibleStores: visible, hiddenStores: hidden };
  }, [sortedStores, filterBarWidth, activeStoreId, t]);

  function handleFilterBarLayout(e: { nativeEvent: { layout: { width: number } } }) {
    setFilterBarWidth(e.nativeEvent.layout.width);
  }

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
    toast.show({ message: t('toast.listRenamed'), type: 'success' });
  }

  function resetSelection() {
    setIsSelectionMode(false);
    setSelectedItemRowIds(new Set());
    setAvailableLists([]);
  }

  function handleEditPress(item: ItemDisplayData) {
    if (!shoppingList) return;
    const listItem = shoppingList.items.find((i) => i.rowId === item.rowId);
    if (!listItem) return;
    navigation.navigate('ShoppingListItemForm', { item: { rowId: listItem.rowId, productId: listItem.productId, quantity: listItem.quantity, storeId: listItem.storeId }, shoppingListId, products, stores });
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
      getAllShoppingLists()
        .then((allLists) => {
          setAvailableLists(allLists.filter((l) => l.id !== shoppingListId));
        })
        .catch((error) => {
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
    toast.show({ message: t('toast.itemsMoved'), type: 'success' });
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
    toast.show({ message: t('toast.itemsDeleted'), type: 'success' });
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
    toast.show({ message: t('toast.listUnchecked'), type: 'success' });
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
    toast.show({ message: t('toast.completedDeleted'), type: 'success' });
  }

  function handleAddPress() {
    navigation.navigate('ShoppingListItemForm', { item: undefined, shoppingListId, products, stores });
  }

  async function handleCopyList() {
    if (!shoppingList) return;
    const lines: string[] = [
      shoppingList.title,
      `Total: ${globalTotal.toFixed(2)}`,
      '',
      ...items.map((item) => `${item.productName} ... ${item.quantity} ${item.unitLabel}`),
    ];
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    toast.show({ message: t('toast.listCopied'), type: 'success' });
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerWrapper}>
          <ScreenTitle>{t('common.loading')}</ScreenTitle>
          <Pressable onPress={navigation.goBack} style={styles.backButton} hitSlop={8}>
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
          <Pressable onPress={navigation.goBack} style={styles.backButton} hitSlop={8}>
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
        <Pressable onPress={navigation.goBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

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
          <DropdownMenu>
            <DropdownMenuTrigger disabled={items.length === 0} hitSlop={8} style={styles.menuButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={items.length === 0 ? colors.textSecondary : colors.text} />
            </DropdownMenuTrigger>
            <DropdownMenuContent cardStyle={{ minWidth: 200 }}>
              <DropdownMenuItem label={t('listDetail.copyList')} onSelect={handleCopyList} />
              <DropdownMenuItem label={t('listDetail.menuUncheckAll')} onSelect={handleUncheckAll} disabled={doneItems.length === 0} />
              <DropdownMenuItem label={t('listDetail.removeCompleted')} onSelect={handleRemoveCompletedPress} disabled={doneItems.length === 0} />
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      )}

      {shouldShowFilters && (
        <View style={[styles.filterContainer, isSelectionMode && styles.filterContainerMuted]} onLayout={handleFilterBarLayout}>
          <Toggle label={t('listDetail.allStores')} isSelected={activeStoreId === null} onPress={() => handleSelectStore(null)} disabled={isSelectionMode} />
          {visibleStores.map((store) => (
            <Toggle key={store.id} label={store.description} isSelected={activeStoreId === store.id} onPress={() => handleSelectStore(store.id)} disabled={isSelectionMode} />
          ))}
          {hiddenStores.length > 0 && (
            <Pressable style={[styles.moreToggle, { borderColor: colors.border }]} onPress={() => setIsMoreFilterOpen(true)} disabled={isSelectionMode}>
              <Ionicons name="chevron-down" size={16} color={isSelectionMode ? colors.textSecondary : colors.text} />
            </Pressable>
          )}
        </View>
      )}

      <Dialog isOpen={isMoreFilterOpen} onClose={() => setIsMoreFilterOpen(false)}>
        <DialogContent style={[styles.filterDropdownCard, { backgroundColor: colors.cardBackground }]}>
          {hiddenStores.map((store) => (
            <Pressable key={store.id} style={styles.filterDropdownItem} onPress={() => { setIsMoreFilterOpen(false); handleSelectStore(store.id); }}>
              <Text style={[styles.filterDropdownItemText, { color: colors.text }, activeStoreId === store.id && styles.filterDropdownItemTextActive]}>{store.description}</Text>
              {activeStoreId === store.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </Pressable>
          ))}
          <View style={[styles.filterDropdownDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.filterDropdownItem} onPress={() => { setIsMoreFilterOpen(false); handleSelectStore(null); }}>
            <Text style={[styles.filterDropdownItemText, { color: colors.text }, activeStoreId === null && styles.filterDropdownItemTextActive]}>{t('listDetail.allStores')}</Text>
            {activeStoreId === null && <Ionicons name="checkmark" size={18} color={colors.primary} />}
          </Pressable>
        </DialogContent>
      </Dialog>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {pendingItems.length > 0 && (
          pendingItems.map((item) => (
            <ShoppingListItemCard key={item.rowId} isSelected={selectedItemRowIds.has(item.rowId)} isSelectionMode={isSelectionMode} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)}>
              <View style={styles.itemContent}>
                <ShoppingListItemTitle name={item.productName} isDone={false} />
                <View style={styles.itemTags}>
                  {!activeStoreId ? (
                    item.storeDescription ? (
                      <Tag size="sm" label={item.storeDescription} colorIndex={item.storeColor} />
                    ) : (
                      <Text style={[styles.noStoreTag, { color: noStoreColor, borderColor: colors.border }]}>{t('listDetail.noStore')}</Text>
                    )
                  ) : null}
                  <View style={styles.itemTagsRight}>
                    {item.price * item.quantity > 0 ? (
                      <Tag size="sm" label={`$${(item.price * item.quantity).toFixed(2)}`} />
                    ) : null}
                    <Tag size="sm" label={`${item.quantity} ${item.unitLabel}`} />
                  </View>
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
                    {!activeStoreId ? (
                      item.storeDescription ? (
                        <Tag size="sm" label={item.storeDescription} colorIndex={item.storeColor} />
                      ) : (
                        <Text style={[styles.noStoreTag, { color: noStoreColor, borderColor: colors.border }]}>{t('listDetail.noStore')}</Text>
                      )
                    ) : null}
                    <View style={styles.itemTagsRight}>
                      {item.price * item.quantity > 0 ? (
                        <Tag size="sm" label={`$${(item.price * item.quantity).toFixed(2)}`} />
                      ) : null}
                      <Tag size="sm" label={`${item.quantity} ${item.unitLabel}`} />
                    </View>
                  </View>
                </View>
                <ShoppingListCheckCircle isDone={true} onToggle={() => handleToggleDone(item.rowId)} disabled={isSelectionMode} />
              </ShoppingListItemCard>
            ))}
          </View>
        )}
      </ScrollView>

      <ListTitleFormSheet isOpen={isTitleSheetOpen} initialTitle={shoppingList.title} onSave={handleSaveTitle} onClose={() => setIsTitleSheetOpen(false)} />



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
    flexWrap: 'nowrap',
    paddingHorizontal: 16,
    gap: 6,
    paddingTop: 20,
    paddingBottom: 0,
  },
  filterContainerMuted: {
    opacity: 0.5,
  },
  moreToggle: {
    width: 42,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDropdownCard: {
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  filterDropdownItemText: {
    fontSize: 16,
  },
  filterDropdownItemTextActive: {
    fontWeight: '700',
  },
  filterDropdownDivider: {
    height: 1,
    marginHorizontal: 16,
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
    paddingTop: 16,
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
  itemTagsRight: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  noStoreTag: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontStyle: 'italic',
    alignSelf: 'flex-start',
    borderWidth: 1,
    backgroundColor: 'transparent',
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
  menuButtonDisabled: {
    opacity: 0.4,
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
