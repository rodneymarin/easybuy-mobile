import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui/select';
import { useDebounce } from '@lib/hooks/useDebounce';
import { useI18n } from '@lib/i18n';
import type { Product } from '@models/product.model';

export interface ProductPickerProps {
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  products: Product[];
  label?: string;
  style?: ViewStyle;
}

type ViewStyle = import('react-native').ViewStyle;

export default function ProductPicker({ value, onValueChange, placeholder, products, label, style }: ProductPickerProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const query = debouncedSearch.toLowerCase();
    return products.filter((p) => p.productName.toLowerCase().includes(query));
  }, [products, debouncedSearch]);

  const selectedProduct = products.find((p) => p.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger placeholder={placeholder} label={label ?? selectedProduct?.productName} style={style} />
      <SelectContent cardStyle={{ height: 350 }}>
        <View style={styles.searchSection}>
          <Input value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search.products')} />
        </View>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          style={styles.listSection}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={debouncedSearch.trim() ? <Text style={styles.emptyText}>{t('common.noResults')}</Text> : null}
          renderItem={({ item }) => (
            <SelectItem label={item.productName} value={item.id} />
          )}
        />
      </SelectContent>
    </Select>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listSection: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 15,
    paddingTop: 24,
  },
});