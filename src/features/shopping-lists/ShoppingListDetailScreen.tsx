import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActionBar, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, ScreenTitle, ScrollableList, useToast } from '@components/ui';
import { DeleteSelectedSheet, ListTitleFormSheet, MoveItemsSheet, RemoveCompletedSheet, SelectionActions, ShoppingListDetailItemRow, type ItemDisplayData, ShoppingListTotals, StoreFilterBar } from '@features/shopping-lists/components';
import { useItemSelection, useListDetailData, useStoreFilter } from '@features/shopping-lists/hooks';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Product } from '@models/product.model';
import type { Store } from '@models/store.model';

type ListsNavigationParamList = {
  ShoppingListItemForm: { item?: { rowId: number; productId: string; quantity: number; storeId?: string }; shoppingListId: string; products: Product[]; stores: Store[] };
};

type DetailNavigationProp = NativeStackNavigationProp<ListsNavigationParamList>;

export default function ShoppingListDetailScreen() {
  const route = useRoute<{ key: string; name: string; params: { shoppingListId: string } }>();
  const navigation = useNavigation<DetailNavigationProp>();
  const { shoppingListId } = route.params;
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();

  const {
    isLoading,
    shoppingList,
    setShoppingList,
    products,
    stores,
    items,
    globalTotal,
    cartTotal,
    isRemoveCompletedSheetOpen,
    setIsRemoveCompletedSheetOpen,
    isTitleSheetOpen,
    isSavingTitle,
    isRemovingCompleted,
    setIsTitleSheetOpen,
    handleToggleDone,
    handleTitlePress,
    handleSaveTitle,
    handleUncheckAll,
    handleCopyList,
    handleConfirmRemoveCompleted,
  } = useListDetailData({ shoppingListId, toastShow: (message) => toast.show({ message, type: 'success' }), toastMessage: t });

  const {
    activeStoreId,
    setActiveStoreId,
    shouldShowFilters,
    visibleStores,
    hiddenStores,
    filteredItems,
    pendingItems,
    doneItems,
    handleFilterBarLayout,
    handleSelectStore,
  } = useStoreFilter({ items, stores, t });

  const {
    isSelectionMode,
    selectedItemRowIds,
    isDeleteSelectedSheetOpen,
    isMoveSheetOpen,
    availableLists,
    isDeletingSelected,
    isMovingSelected,
    isPinning,
    allSelectedPinned,
    resetSelection,
    toggleItemSelection,
    handleItemLongPress,
    handleMoveSelectedPress,
    handleConfirmMoveItems,
    handleDeleteSelectedPress,
    handleConfirmDeleteSelected,
    handlePinSelectedPress,
    closeDeleteSheet: closeDeleteSelectedSheet,
    closeMoveSheet: closeMoveSelectedSheet,
  } = useItemSelection({
    shoppingListId,
    items,
    setShoppingList: (updater) => setShoppingList(updater),
    setActiveStoreId,
    activeStoreId,
    toastShow: (message) => toast.show({ message, type: 'success' }),
    toastMessage: t,
  });

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

  function handleRemoveCompletedPress() {
    setIsRemoveCompletedSheetOpen(true);
  }

  function handleAddPress() {
    navigation.navigate('ShoppingListItemForm', { item: undefined, shoppingListId, products, stores });
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

      <ActionBar>
        {isSelectionMode ? (
          <SelectionActions selectedCount={selectedItemRowIds.size} onClose={resetSelection} onMove={handleMoveSelectedPress} onPin={handlePinSelectedPress} onDelete={handleDeleteSelectedPress} isAllPinned={allSelectedPinned} hasAvailableLists={availableLists.length > 0} isLoading={isPinning} />
        ) : (
          <>
            <View style={styles.totalsRow}>
              <View style={styles.totalsFlex}>
                <ShoppingListTotals globalTotal={globalTotal} cartTotal={cartTotal} onAddPress={handleAddPress} />
              </View>
              <DropdownMenu>
                <DropdownMenuTrigger disabled={items.length === 0} hitSlop={8} style={styles.menuButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color={items.length === 0 ? colors.textSecondary : colors.text} />
                </DropdownMenuTrigger>
                <DropdownMenuContent cardStyle={{ minWidth: 200 }}>
                  <DropdownMenuItem label={t('listDetail.copyList')} onSelect={() => handleCopyList(filteredItems)} />
                  <DropdownMenuItem label={t('listDetail.menuUncheckAll')} onSelect={handleUncheckAll} disabled={doneItems.length === 0} />
                  <DropdownMenuItem label={t('listDetail.removeCompleted')} onSelect={handleRemoveCompletedPress} disabled={doneItems.length === 0} />
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
            {shouldShowFilters && <View style={styles.filterRow}><StoreFilterBar visibleStores={visibleStores} hiddenStores={hiddenStores} activeStoreId={activeStoreId} onSelectStore={handleSelectStore} onLayout={handleFilterBarLayout} /></View>}
          </>
        )}
      </ActionBar>

      <ScrollableList data={pendingItems} keyExtractor={(item) => String(item.rowId)}
        renderItem={({ item }) => (
          <ShoppingListDetailItemRow item={item} isSelectionMode={isSelectionMode} isSelected={selectedItemRowIds.has(item.rowId)} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)} onToggleDone={() => handleToggleDone(item.rowId)} />
        )}
        ListEmptyComponent={
          items.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('listDetail.empty')}</Text>
          ) : filteredItems.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('listDetail.noFilterMatch')}</Text>
          ) : null
        }
      >
        <View>
          {doneItems.length > 0 && (
            <View style={styles.doneSection}>
              <Text style={[styles.doneSectionTitle, { color: colors.textSecondary }]}>{t('listDetail.doneSection')}</Text>
              <View style={[styles.doneDivider, { backgroundColor: colors.border }]} />
              {doneItems.map((item) => (
                <ShoppingListDetailItemRow key={item.rowId} item={item} isSelectionMode={isSelectionMode} isSelected={selectedItemRowIds.has(item.rowId)} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)} onToggleDone={() => handleToggleDone(item.rowId)} />
              ))}
            </View>
          )}
          {filteredItems.length > 0 && (
            <Text style={[styles.countLabel, { color: colors.textSecondary }]}>{t('list.items', { completed: doneItems.length, count: filteredItems.length })}</Text>
          )}
        </View>
      </ScrollableList>

      <ListTitleFormSheet isOpen={isTitleSheetOpen} initialTitle={shoppingList.title} onSave={handleSaveTitle} onClose={() => setIsTitleSheetOpen(false)} isLoading={isSavingTitle} />

      <RemoveCompletedSheet isOpen={isRemoveCompletedSheetOpen} onClose={() => setIsRemoveCompletedSheetOpen(false)} isLoading={isRemovingCompleted} onConfirm={() => handleConfirmRemoveCompleted(doneItems, items, activeStoreId, setActiveStoreId)} />

      <MoveItemsSheet isOpen={isMoveSheetOpen} onClose={closeMoveSelectedSheet} availableLists={availableLists} isMoving={isMovingSelected} onMoveToList={handleConfirmMoveItems} />

      <DeleteSelectedSheet isOpen={isDeleteSelectedSheetOpen} onClose={closeDeleteSelectedSheet} onConfirm={handleConfirmDeleteSelected} selectedCount={selectedItemRowIds.size} isLoading={isDeletingSelected} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  headerWrapper: { position: 'relative' },
  filterRow: { marginTop: 6 },
  backButton: { position: 'absolute', left: 16, top: -6, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  loader: { marginTop: 40 },
  errorText: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  emptyText: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  doneSection: { marginTop: 8 },
  doneSectionTitle: { fontSize: 13, fontWeight: '600', marginHorizontal: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  doneDivider: { height: 1, marginBottom: 12 },
  totalsRow: { flexDirection: 'row', alignItems: 'center' },
  totalsFlex: { flex: 1 },
  menuButton: { padding: 8, marginRight: 12 },
  countLabel: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
});