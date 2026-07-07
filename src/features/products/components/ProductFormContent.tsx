import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Input, Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui';
import ProductPrices from './ProductPrices';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { UNIT_OF_MEASUREMENT } from '@models/product.model';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

interface ProductFormContentProps {
  productName: string;
  unitOfMeasurement: string;
  prices: Price[];
  stores: StoreListData[];
  noPadding?: boolean;
  onProductNameChange: (name: string) => void;
  onUnitOfMeasurementChange: (unit: string) => void;
  onPricesChange: (prices: Price[]) => void;
}

export default function ProductFormContent({ productName, unitOfMeasurement, prices, stores, noPadding, onProductNameChange, onUnitOfMeasurementChange, onPricesChange }: ProductFormContentProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  const selectedUnit = UNIT_OF_MEASUREMENT.find((u) => u.id === unitOfMeasurement);

  return (
    <ScrollView style={styles.body} contentContainerStyle={noPadding ? styles.bodyContentNoPadding : styles.bodyContent} keyboardShouldPersistTaps="handled">
      <Input value={productName} onChangeText={onProductNameChange} placeholder={t('products.addModal.namePlaceholder')} autoFocus returnKeyType="next" />
      <Text style={[styles.unitLabel, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
      <Select value={unitOfMeasurement} onValueChange={onUnitOfMeasurementChange}>
        <SelectTrigger placeholder={t('products.addModal.unitLabel')} label={selectedUnit ? t(`unit.${selectedUnit.id}`) : undefined} />
        <SelectContent title={t('products.addModal.unitLabel')} cardStyle={styles.selectorModal}>
          <FlatList data={UNIT_OF_MEASUREMENT} keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SelectItem label={t(`unit.${item.id}`)} value={item.id} />
            )}
          />
        </SelectContent>
      </Select>
      <ProductPrices prices={prices} stores={stores} onPricesChange={onPricesChange} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bodyContentNoPadding: {
    paddingBottom: 12,
  },
  unitLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  selectorModal: {
    padding: 20,
    maxHeight: 350,
  },
});
