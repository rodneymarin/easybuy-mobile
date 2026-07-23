import { useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { Store } from '@models/store.model';
import type { ItemDisplayData } from '../components/ShoppingListDetailItemRow';

interface UseStoreFilterArgs {
  items: ItemDisplayData[];
  stores: Store[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

const EST_CHAR_WIDTH = 8.5;
const MORE_TOGGLE_WIDTH = 40;

function useStoreFilter({ items, stores, t }: UseStoreFilterArgs) {
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [filterBarWidth, setFilterBarWidth] = useState(0);

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

  const filteredItems = useMemo(() => {
    if (!activeStoreId) return items;
    return items.filter((item) => item.storeId === activeStoreId);
  }, [items, activeStoreId]);

  const pendingItems = useMemo(() => filteredItems.filter((item) => !item.isDone).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return a.productName.localeCompare(b.productName);
  }), [filteredItems]);
  const doneItems = useMemo(() => filteredItems.filter((item) => item.isDone).sort((a, b) => a.productName.localeCompare(b.productName)), [filteredItems]);

  function handleFilterBarLayout(e: LayoutChangeEvent) {
    setFilterBarWidth(e.nativeEvent.layout.width);
  }

  function handleSelectStore(storeId: string | null) {
    setActiveStoreId(storeId);
  }

  return {
    activeStoreId,
    setActiveStoreId,
    hasStorelessItems,
    hasStoredItems,
    shouldShowFilters,
    visibleStores,
    hiddenStores,
    filteredItems,
    pendingItems,
    doneItems,
    handleFilterBarLayout,
    handleSelectStore,
  };
}

export type { UseStoreFilterArgs };
export type StoreFilterReturn = ReturnType<typeof useStoreFilter>;
export { useStoreFilter };
