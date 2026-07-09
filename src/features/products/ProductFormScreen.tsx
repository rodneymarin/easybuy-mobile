import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, ConfirmDeleteSheet, ScreenTitle, useToast } from '@components/ui';
import { ProductFormContent } from '@features/products/components';
import type { ProductPricesHandle } from '@features/products/components/ProductPrices';
import { createProduct, getProductByName, updateProduct, deleteProduct } from '@lib/repositories/products';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { generateUUID } from '@lib/uuid';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

export default function ProductFormScreen() {
  const route = useRoute<{ key: string; name: string; params: { product?: { id: string; productName: string; unitOfMeasurement: string; prices?: Price[] }; stores: StoreListData[] } }>();
  const navigation = useNavigation();
  const { product, stores } = route.params;
  const { colors } = useTheme();
  const { t } = useI18n();
  const pricesRef = useRef<ProductPricesHandle>(null);
  const latestPricesRef = useRef<Price[]>([]);
  const [productName, setProductName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);
  
  function handlePricesChange(newPrices: Price[]) {
    latestPricesRef.current = newPrices;
    setPrices(newPrices);
  }
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const toast = useToast();

  const isEditMode = product !== undefined;
  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;

  useEffect(() => {
    const initialPrices = product?.prices ?? [];
    setProductName(product?.productName ?? '');
    setUnitOfMeasurement(product?.unitOfMeasurement ?? '');
    setPrices(initialPrices);
    latestPricesRef.current = initialPrices;
  }, [product]);

  async function handleSave() {
    if (!isFormValid) return;
    pricesRef.current?.confirmPendingPrice();
    Keyboard.dismiss();
    const trimmedName = productName.trim();
    const existing = await getProductByName(trimmedName, product?.id);
    if (existing) {
      toast.show({ message: t('toast.productNameExists'), type: 'error' });
      return;
    }
    const pricesToSave = latestPricesRef.current;
    if (product) {
      await updateProduct(product.id, trimmedName, unitOfMeasurement, pricesToSave);
      toast.show({ message: t('toast.productUpdated'), type: 'success' });
    } else {
      await createProduct(generateUUID(), trimmedName, unitOfMeasurement, pricesToSave);
      toast.show({ message: t('toast.productCreated'), type: 'success' });
    }
    navigation.goBack();
  }

  function handleDeletePress() {
    Keyboard.dismiss();
    setIsDeleteSheetOpen(true);
  }

  async function handleConfirmDelete() {
    if (!product) return;
    Keyboard.dismiss();
    await deleteProduct(product.id);
    setIsDeleteSheetOpen(false);
    toast.show({ message: t('toast.productDeleted'), type: 'success' });
    navigation.goBack();
  }

  function handleGoBack() {
    Keyboard.dismiss();
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <View style={styles.headerWrapper}>
        <ScreenTitle>{isEditMode ? t('products.editTitle') : t('products.addTitle')}</ScreenTitle>
        <Pressable onPress={handleGoBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ProductFormContent ref={pricesRef} productName={productName} unitOfMeasurement={unitOfMeasurement} prices={prices} stores={stores} onProductNameChange={setProductName} onUnitOfMeasurementChange={setUnitOfMeasurement} onPricesChange={handlePricesChange} />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.buttonRow}>
          {isEditMode && (
            <Button variant="destructive" style={styles.halfButton} onPress={handleDeletePress}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.delete')}</Text>
            </Button>
          )}
          <Button variant="secondary" style={styles.halfButton} onPress={handleGoBack}>
            <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
          </Button>
        </View>
        <Button variant="primary" style={styles.actionButton} onPress={handleSave} disabled={!isFormValid}>
          <Text style={styles.buttonTextPrimary}>{t('products.addModal.save')}</Text>
        </Button>
      </View>

      <ConfirmDeleteSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)} onConfirm={handleConfirmDelete} title={t('products.deleteModal.title')} message={t('products.deleteModal.confirmMessage', { product: product?.productName ?? '' })} warning={t('products.deleteModal.warning')} confirmLabel={t('products.deleteModal.confirm')} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerWrapper: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfButton: {
    flex: 1,
    justifyContent: 'center',
  },
  actionButton: {
    justifyContent: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
