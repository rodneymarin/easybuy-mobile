import { FlatList, StyleSheet } from 'react-native';
import { ProductListItem } from '@features/products/components';

export interface ProductListData {
  id: string;
  productName: string;
  unitOfMeasurement: string;
}

interface ProductListProps {
  data: ProductListData[];
  selectedIds?: Set<string>;
  isSelectionMode?: boolean;
  onProductPress?: (id: string) => void;
  onProductLongPress?: (id: string) => void;
}

export default function ProductList({ data, selectedIds, isSelectionMode, onProductPress, onProductLongPress }: ProductListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ProductListItem productName={item.productName} unitOfMeasurement={item.unitOfMeasurement} isSelected={selectedIds?.has(item.id)} isSelectionMode={isSelectionMode} onPress={onProductPress ? () => onProductPress(item.id) : undefined} onLongPress={onProductLongPress ? () => onProductLongPress(item.id) : undefined} />
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
