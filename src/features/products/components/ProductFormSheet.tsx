import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet, Button } from '@components/ui';
import { ProductFormContent } from '@features/products/components';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

interface ProductFormSheetProps {
  isOpen: boolean;
  stores: StoreListData[];
  onSave: (productName: string, unitOfMeasurement: string, prices: Price[]) => void;
  onClose: () => void;
}

export default function ProductFormSheet({ isOpen, stores, onSave, onClose }: ProductFormSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [productName, setProductName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);

  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;

  useEffect(() => {
    if (isOpen) {
      setProductName('');
      setUnitOfMeasurement('');
      setPrices([]);
    }
  }, [isOpen]);

  function handleSave() {
    if (!isFormValid) return;
    onSave(productName.trim(), unitOfMeasurement, prices);
  }

  function handleClose() {
    setProductName('');
    setUnitOfMeasurement('');
    setPrices([]);
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} percentage={0.75}>
      <Text style={[styles.title, { color: colors.text }]}>{t('products.addTitle')}</Text>
      <View style={styles.content}>
        <ProductFormContent productName={productName} unitOfMeasurement={unitOfMeasurement} prices={prices} stores={stores} noPadding onProductNameChange={setProductName} onUnitOfMeasurementChange={setUnitOfMeasurement} onPricesChange={setPrices} />
      </View>
      <Button variant="primary" style={styles.saveButton} onPress={handleSave} disabled={!isFormValid}>
        <Text style={styles.buttonTextPrimary}>{t('products.addModal.save')}</Text>
      </Button>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  content: {
    height: 320,
  },
  saveButton: {
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
