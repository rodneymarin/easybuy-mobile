import { FlatList, StyleSheet } from 'react-native';
import { StoreListItem } from '@features/stores/components';

export interface StoreListData {
  id: string;
  description: string;
}

interface StoreListProps {
  data: StoreListData[];
}

export default function StoreList({ data }: StoreListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoreListItem description={item.description} />
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
