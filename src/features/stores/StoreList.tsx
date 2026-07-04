import { FlatList, StyleSheet } from 'react-native';
import { StoreListItem } from '@features/stores/components';

export interface StoreListData {
  id: string;
  description: string;
}

interface StoreListProps {
  data: StoreListData[];
  onStorePress: (id: string) => void;
}

export default function StoreList({ data, onStorePress }: StoreListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoreListItem id={item.id} description={item.description} onPress={onStorePress} />
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
