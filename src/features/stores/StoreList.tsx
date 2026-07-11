import { type ReactElement } from 'react';
import { ScrollableList } from '@components/ui';
import { StoreListItem } from '@features/stores/components';

export interface StoreListData {
  id: string;
  description: string;
  color: number;
}

interface StoreListProps {
  data: StoreListData[];
  children?: ReactElement;
  selectedIds?: Set<string>;
  isSelectionMode?: boolean;
  onStorePress: (id: string) => void;
  onStoreLongPress?: (id: string) => void;
}

export default function StoreList({ data, children, selectedIds, isSelectionMode, onStorePress, onStoreLongPress }: StoreListProps) {
  return (
    <ScrollableList data={data} keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreListItem id={item.id} description={item.description} color={item.color} isSelected={selectedIds?.has(item.id)} isSelectionMode={isSelectionMode} onPress={onStorePress} onLongPress={onStoreLongPress ? () => onStoreLongPress(item.id) : undefined} />
      )}
    >
      {children}
    </ScrollableList>
  );
}

