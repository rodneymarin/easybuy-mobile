import { FlatList, StyleSheet } from 'react-native';
import { ProductListItem } from '@features/products/components';

export interface ProductListData {
  id: string;
  productName: string;
  unitOfMeasurement: string;
}

interface ProductListProps {
  data: ProductListData[];
}

export default function ProductList({ data }: ProductListProps) {
  return (
    <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ProductListItem productName={item.productName} unitOfMeasurement={item.unitOfMeasurement} />
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
