import { useState } from 'react';

export function useSelectionMode() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function resetSelection() {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }

  function startSelection(id: string) {
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handlePress(id: string, onPress?: (id: string) => void) {
    if (isSelectionMode) {
      toggleSelection(id);
    } else {
      onPress?.(id);
    }
  }

  function exitSelectionMode() {
    resetSelection();
  }

  return {
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    setSelectedIds,
    resetSelection,
    startSelection,
    toggleSelection,
    handlePress,
    exitSelectionMode,
  };
}
