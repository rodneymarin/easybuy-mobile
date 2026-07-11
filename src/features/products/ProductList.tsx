import { type ReactElement } from 'react';
import { ScrollableList } from '@components/ui';
import { ProductListItem } from '@features/products/components';

export interface ProductListData {
  id: string;
  productName: string;
  unitOfMeasurement: string;
}

interface ProductListProps {
  data: ProductListData[];
  children?: ReactElement;
  selectedIds?: Set<string>;
  isSelectionMode?: boolean;
  onProductPress?: (id: string) => void;
  onProductLongPress?: (id: string) => void;
}

export default function ProductList({ data, children, selectedIds, isSelectionMode, onProductPress, onProductLongPress }: ProductListProps) {
  return (
    <ScrollableList data={data} keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductListItem productName={item.productName} unitOfMeasurement={item.unitOfMeasurement} isSelected={selectedIds?.has(item.id)} isSelectionMode={isSelectionMode} onPress={onProductPress ? () => onProductPress(item.id) : undefined} onLongPress={onProductLongPress ? () => onProductLongPress(item.id) : undefined} />
      )}
    >
      {children}
    </ScrollableList>
  );
}

