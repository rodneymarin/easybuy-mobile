import { useState } from 'react';
import { FlatList, Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Input } from '@components/ui';
import { ProductPrices } from '@features/products/components';
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
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);

  const selectedUnit = UNIT_OF_MEASUREMENT.find((u) => u.id === unitOfMeasurement);

  return (
    <>
      <ScrollView style={styles.body} contentContainerStyle={noPadding ? styles.bodyContentNoPadding : styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Input value={productName} onChangeText={onProductNameChange} placeholder={t('products.addModal.namePlaceholder')} autoFocus returnKeyType="next" />
        <Text style={[styles.unitLabel, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
        <Pressable onPress={() => setIsUnitSelectorOpen(true)} style={[styles.unitSelector, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.unitSelectorText, { color: selectedUnit ? colors.text : colors.placeholderText }]}>
            {selectedUnit ? t(`unit.${selectedUnit.id}`) : t('products.addModal.unitLabel')}
          </Text>
          <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
        </Pressable>
        <ProductPrices prices={prices} stores={stores} onPricesChange={onPricesChange} />
      </ScrollView>

      <RNModal visible={isUnitSelectorOpen} transparent animationType="fade" onRequestClose={() => setIsUnitSelectorOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsUnitSelectorOpen(false)}>
          <View style={[styles.selectorModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.selectorTitle, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
            <FlatList data={UNIT_OF_MEASUREMENT} keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => { onUnitOfMeasurementChange(item.id); setIsUnitSelectorOpen(false); }} style={[styles.selectorItem, { borderColor: colors.border, backgroundColor: unitOfMeasurement === item.id ? colors.surface : 'transparent' }]}>
                  <Text style={[styles.selectorItemText, { color: colors.text }]}>{t(`unit.${item.id}`)}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </RNModal>
    </>
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
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  unitSelectorText: {
    flex: 1,
    fontSize: 15,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  selectorModal: {
    borderRadius: 16,
    padding: 20,
    maxHeight: 350,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectorItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectorItemText: {
    fontSize: 15,
  },
});
