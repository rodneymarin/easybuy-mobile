import { FlatList, StyleSheet } from 'react-native';
import ShoppingListItem from './components/ShoppingListItem';

export interface ShoppingListData {
  id: string;
  title: string;
  itemCount: number;
  totalAmount: number;
}

interface ShoppingListProps {
  data: ShoppingListData[];
}

export default function ShoppingList({ data }: ShoppingListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ShoppingListItem
          title={item.title}
          itemCount={item.itemCount}
          totalAmount={item.totalAmount}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
