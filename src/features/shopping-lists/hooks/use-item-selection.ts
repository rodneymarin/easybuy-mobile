import { useMemo, useState } from 'react';
import type { ShoppingList } from '@models/shopping-list.model';
import type { ItemDisplayData } from '../components/ShoppingListDetailItemRow';
import { getAllShoppingLists, moveItemsToList, pinItems, removeItemsFromList } from '@lib/repositories/shopping-lists';

interface UseItemSelectionArgs {
  shoppingListId: string;
  items: ItemDisplayData[];
  setShoppingList: (updater: (prev: ShoppingList | null) => ShoppingList | null) => void;
  setActiveStoreId: (id: string | null) => void;
  activeStoreId: string | null;
  toastShow: (message: string, type: 'success') => void;
  toastMessage: (key: string) => string;
}

function useItemSelection({ shoppingListId, items, setShoppingList, setActiveStoreId, activeStoreId, toastShow, toastMessage: tt }: UseItemSelectionArgs) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemRowIds, setSelectedItemRowIds] = useState<Set<number>>(new Set());
  const [isDeleteSelectedSheetOpen, setIsDeleteSelectedSheetOpen] = useState(false);
  const [isMoveSheetOpen, setIsMoveSheetOpen] = useState(false);
  const [availableLists, setAvailableLists] = useState<{ id: string; title: string }[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isMovingSelected, setIsMovingSelected] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const allSelectedPinned = useMemo(() => {
    if (selectedItemRowIds.size === 0) return false;
    return Array.from(selectedItemRowIds).every((id) => items.find((item) => item.rowId === id)?.isPinned);
  }, [selectedItemRowIds, items]);

  function resetSelection() {
    setIsSelectionMode(false);
    setSelectedItemRowIds(new Set());
    setAvailableLists([]);
  }

  function toggleItemSelection(rowId: number) {
    setSelectedItemRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
        if (next.size === 0) setIsSelectionMode(false);
      } else {
        next.add(rowId);
      }
      return next;
    });
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

  function handleMoveSelectedPress() {
    setIsMoveSheetOpen(true);
  }

  async function handleConfirmMoveItems(targetListId: string) {
    if (isMovingSelected) return;
    const rowIds = Array.from(selectedItemRowIds);
    setIsMovingSelected(true);
    try {
      await moveItemsToList(rowIds, targetListId);
      setShoppingList((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((item) => !rowIds.includes(item.rowId)) };
      });
      if (activeStoreId) {
        const remainingAfterMove = items.filter((item) => !rowIds.includes(item.rowId));
        if (!remainingAfterMove.some((item) => item.storeId === activeStoreId)) {
          setActiveStoreId(null);
        }
      }
      resetSelection();
      setIsMoveSheetOpen(false);
      toastShow(tt('toast.itemsMoved'), 'success');
    } catch (error) {
      console.error("Failed to move items:", error);
    } finally {
      setIsMovingSelected(false);
    }
  }

  function handleDeleteSelectedPress() {
    setIsDeleteSelectedSheetOpen(true);
  }

  async function handleConfirmDeleteSelected() {
    if (isDeletingSelected) return;
    const rowIds = Array.from(selectedItemRowIds);
    setIsDeletingSelected(true);
    try {
      await removeItemsFromList(rowIds);
      setShoppingList((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((item) => !rowIds.includes(item.rowId)) };
      });
      if (activeStoreId) {
        const remainingAfterDelete = items.filter((item) => !rowIds.includes(item.rowId));
        if (!remainingAfterDelete.some((item) => item.storeId === activeStoreId)) {
          setActiveStoreId(null);
        }
      }
      resetSelection();
      setIsDeleteSelectedSheetOpen(false);
      toastShow(tt('toast.itemsDeleted'), 'success');
    } catch (error) {
      console.error("Failed to delete items:", error);
    } finally {
      setIsDeletingSelected(false);
    }
  }

  async function handlePinSelectedPress() {
    if (isPinning) return;
    const rowIds = Array.from(selectedItemRowIds);
    const allPinned = rowIds.every((id) => items.find((item) => item.rowId === id)?.isPinned);
    const newPinned = !allPinned;
    setIsPinning(true);
    try {
      await pinItems(rowIds, newPinned);
      setShoppingList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => rowIds.includes(item.rowId) ? { ...item, pinned: newPinned } : item),
        };
      });
      resetSelection();
    } catch (error) {
      console.error("Failed to pin items:", error);
    } finally {
      setIsPinning(false);
    }
  }

  return {
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
    closeDeleteSheet: () => setIsDeleteSelectedSheetOpen(false),
    closeMoveSheet: () => setIsMoveSheetOpen(false),
  };
}

export type { UseItemSelectionArgs };
export { useItemSelection };