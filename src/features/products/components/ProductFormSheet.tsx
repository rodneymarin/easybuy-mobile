import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BottomSheet, Button } from '@components/ui';
import ProductFormContent from './ProductFormContent';
import type { ProductPricesHandle } from './ProductPrices';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Price } from '@models/price.model';
import type { Product } from '@models/product.model';
import type { StoreListData } from '@features/stores';

interface ProductFormSheetProps {
  isOpen: boolean;
  stores: StoreListData[];
  onSave: (productName: string, unitOfMeasurement: string, prices: Price[], productId?: string) => void;
  onClose: () => void;
  initialProduct?: Product | null;
  isLoading?: boolean;
}

export default function ProductFormSheet({ isOpen, stores, onSave, onClose, initialProduct, isLoading }: ProductFormSheetProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const pricesRef = useRef<ProductPricesHandle>(null);
  const latestPricesRef = useRef<Price[]>([]);
  const [productName, setProductName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);

  const isEditMode = initialProduct !== undefined && initialProduct !== null;
  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;

  function handlePricesChange(newPrices: Price[]) {
    latestPricesRef.current = newPrices;
    setPrices(newPrices);
  }

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setProductName(initialProduct.productName);
        setUnitOfMeasurement(initialProduct.unitOfMeasurement);
        setPrices(initialProduct.prices ?? []);
        latestPricesRef.current = initialProduct.prices ?? [];
      } else {
        setProductName('');
        setUnitOfMeasurement('');
        setPrices([]);
        latestPricesRef.current = [];
      }
    }
  }, [isOpen, initialProduct]);

  function handleSave() {
    if (!isFormValid) return;
    pricesRef.current?.confirmPendingPrice();
    onSave(productName.trim(), unitOfMeasurement, latestPricesRef.current, initialProduct?.id);
  }

  function handleClose() {
    setProductName('');
    setUnitOfMeasurement('');
    setPrices([]);
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} percentage={0.9}>
      <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? t('products.editTitle') : t('products.addTitle')}</Text>
      <ProductFormContent ref={pricesRef} productName={productName} unitOfMeasurement={unitOfMeasurement} prices={prices} stores={stores} noPadding onProductNameChange={setProductName} onUnitOfMeasurementChange={setUnitOfMeasurement} onPricesChange={handlePricesChange} />
      <Button variant="primary" style={styles.saveButton} onPress={handleSave} disabled={!isFormValid} isLoading={isLoading}>
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
