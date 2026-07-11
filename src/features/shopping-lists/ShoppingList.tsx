import { type ReactElement } from 'react';
import { ScrollableList } from '@components/ui';
import { ShoppingListItem } from '@features/shopping-lists/components';

export interface ShoppingListData {
  id: string;
  title: string;
  itemCount: number;
  totalAmount: number;
}

interface ShoppingListProps {
  data: ShoppingListData[];
  children?: ReactElement;
  onListPress?: (id: string) => void;
  onRemoveList?: (id: string) => void;
}

export default function ShoppingList({ data, children, onListPress, onRemoveList }: ShoppingListProps) {
  return (
    <ScrollableList data={data} keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ShoppingListItem title={item.title} itemCount={item.itemCount} totalAmount={item.totalAmount} onPress={onListPress ? () => onListPress(item.id) : undefined} onRemove={onRemoveList ? () => onRemoveList(item.id) : undefined} />
      )}
    >
      {children}
    </ScrollableList>
  );
}

