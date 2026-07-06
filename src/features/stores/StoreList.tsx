import { FlatList, StyleSheet } from 'react-native';
import { StoreListItem } from '@features/stores/components';

export interface StoreListData {
  id: string;
  description: string;
}

interface StoreListProps {
  data: StoreListData[];
  selectedIds?: Set<string>;
  isSelectionMode?: boolean;
  onStorePress: (id: string) => void;
  onStoreLongPress?: (id: string) => void;
}

export default function StoreList({ data, selectedIds, isSelectionMode, onStorePress, onStoreLongPress }: StoreListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoreListItem id={item.id} description={item.description}
          isSelected={selectedIds?.has(item.id)} isSelectionMode={isSelectionMode}
          onPress={onStorePress} onLongPress={onStoreLongPress} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
