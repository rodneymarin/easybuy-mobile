import { FlatList, StyleSheet } from 'react-native';
import { ShoppingListItem } from '@features/shopping-lists/components';

export interface ShoppingListData {
  id: string;
  title: string;
  itemCount: number;
  totalAmount: number;
}

interface ShoppingListProps {
  data: ShoppingListData[];
  onListPress?: (id: string) => void;
  onRemoveList?: (id: string) => void;
}

export default function ShoppingList({ data, onListPress, onRemoveList }: ShoppingListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ShoppingListItem title={item.title} itemCount={item.itemCount} totalAmount={item.totalAmount} onPress={onListPress ? () => onListPress(item.id) : undefined} onRemove={onRemoveList ? () => onRemoveList(item.id) : undefined} />
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
