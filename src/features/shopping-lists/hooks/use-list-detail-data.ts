import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import type { ShoppingList } from '@models/shopping-list.model';
import type { Product } from '@models/product.model';
import type { Store } from '@models/store.model';
import type { ItemDisplayData } from '../components/ShoppingListDetailItemRow';
import { getShoppingListById, toggleItemDone, removeItemsFromList, updateShoppingListTitle } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { getAllStores } from '@lib/repositories/stores';
import { tUnit } from '@lib/i18n';

interface UseListDetailDataArgs {
  shoppingListId: string;
  toastShow: (message: string, type: 'success') => void;
  toastMessage: (key: string, params?: Record<string, string | number>) => string;
}

function tWrapper(t: (key: string, params?: Record<string, string | number>) => string) {
  return (key: string, params?: Record<string, string | number>) => t(key, params);
}

function useListDetailData({ shoppingListId, toastShow, toastMessage: t }: UseListDetailDataArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isRemoveCompletedSheetOpen, setIsRemoveCompletedSheetOpen] = useState(false);
  const [isTitleSheetOpen, setIsTitleSheetOpen] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isRemovingCompleted, setIsRemovingCompleted] = useState(false);

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
      const unitLabel = !product ? '' : tUnit(t, product.unitOfMeasurement, item.quantity);
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
        isPinned: item.pinned ?? false,
      };
    });
  }, [shoppingList, productMap, storeMap, storeColorMap, t]);

  const globalTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.filter((item) => item.isDone).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  async function handleToggleDone(rowId: number) {
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => item.rowId === rowId ? { ...item, done: !item.done } : item),
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
    if (isSavingTitle) return;
    setIsSavingTitle(true);
    try {
      await updateShoppingListTitle(shoppingListId, title);
      setShoppingList((prev) => prev ? { ...prev, title } : prev);
      setIsTitleSheetOpen(false);
      toastShow(t('toast.listRenamed'), 'success');
    } catch (error) {
      console.error("Failed to save title:", error);
    } finally {
      setIsSavingTitle(false);
    }
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
    toastShow(t('toast.listUnchecked'), 'success');
  }
  
  async function handleCopyList(filteredItems: ItemDisplayData[]) {
    if (!shoppingList) return;
    const lines: string[] = filteredItems.map((item) => `${item.productName} ... ${item.quantity} ${item.unitLabel}`);
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    toastShow(t('toast.listCopied'), 'success');
  }

  async function handleConfirmRemoveCompleted(doneItems: ItemDisplayData[], allItems: ItemDisplayData[], currentActiveStoreId: string | null, setStore: (id: string | null) => void) {
    if (isRemovingCompleted) return;
    const doneRowIds = doneItems.map((item) => item.rowId);
    setIsRemovingCompleted(true);
    try {
      await removeItemsFromList(doneRowIds);
      setShoppingList((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((item) => !item.done) };
      });
      if (currentActiveStoreId) {
        const remainingAfterRemove = allItems.filter((item) => !item.isDone && !doneRowIds.includes(item.rowId));
        if (!remainingAfterRemove.some((item) => item.storeId === currentActiveStoreId)) {
          setStore(null);
        }
      }
      setIsRemoveCompletedSheetOpen(false);
      toastShow(t('toast.completedDeleted'), 'success');
    } catch (error) {
      console.error("Failed to remove completed items:", error);
    } finally {
      setIsRemovingCompleted(false);
    }
  }

  return {
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
    setIsRemovingCompleted,
    setIsTitleSheetOpen,
    handleToggleDone,
    handleTitlePress,
    handleSaveTitle,
    handleUncheckAll,
    handleCopyList,
    handleConfirmRemoveCompleted,
  };
}

export type { UseListDetailDataArgs };
export { useListDetailData };