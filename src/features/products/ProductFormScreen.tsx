import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, BottomSheet, ScreenTitle } from '@components/ui';
import { ProductFormContent } from '@features/products/components';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

interface ProductFormScreenProps {
  product?: { id: string; productName: string; unitOfMeasurement: string; prices?: Price[] };
  stores: StoreListData[];
  onBack: () => void;
  onSave: (productName: string, unitOfMeasurement: string, prices: Price[]) => void;
  onUpdate: (id: string, productName: string, unitOfMeasurement: string, prices: Price[]) => void;
  onDelete: (id: string) => void;
}

export default function ProductFormScreen({ product, stores, onBack, onSave, onUpdate, onDelete }: ProductFormScreenProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [productName, setProductName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  const isEditMode = product !== undefined;
  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;

  useEffect(() => {
    setProductName(product?.productName ?? '');
    setUnitOfMeasurement(product?.unitOfMeasurement ?? '');
    setPrices(product?.prices ?? []);
  }, [product]);

  function handleSave() {
    if (!isFormValid) return;
    Keyboard.dismiss();
    if (product) {
      onUpdate(product.id, productName.trim(), unitOfMeasurement, prices);
    } else {
      onSave(productName.trim(), unitOfMeasurement, prices);
    }
  }

  function handleDeletePress() {
    Keyboard.dismiss();
    setIsDeleteSheetOpen(true);
  }

  function handleConfirmDelete() {
    if (!product) return;
    Keyboard.dismiss();
    onDelete(product.id);
    setIsDeleteSheetOpen(false);
  }

  function handleGoBack() {
    Keyboard.dismiss();
    onBack();
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <View style={styles.headerWrapper}>
        <ScreenTitle>{isEditMode ? t('products.editTitle') : t('products.addTitle')}</ScreenTitle>
        <Pressable onPress={handleGoBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ProductFormContent productName={productName} unitOfMeasurement={unitOfMeasurement} prices={prices} stores={stores} onProductNameChange={setProductName} onUnitOfMeasurementChange={setUnitOfMeasurement} onPricesChange={setPrices} />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {isEditMode && (
          <Button variant="destructive" style={styles.actionButton} onPress={handleDeletePress}>
            <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.delete')}</Text>
          </Button>
        )}
        <Button variant="secondary" style={styles.actionButton} onPress={handleGoBack}>
          <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
        </Button>
        <Button variant="primary" style={styles.actionButton} onPress={handleSave} disabled={!isFormValid}>
          <Text style={styles.buttonTextPrimary}>{t('products.addModal.save')}</Text>
        </Button>
      </View>

      <BottomSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)}>
        <Text style={[styles.deleteSheetTitle, { color: colors.text }]}>{t('products.deleteModal.title')}</Text>
        <Text style={[styles.deleteSheetMessage, { color: colors.text }]}>{t('products.deleteModal.confirmMessage', { product: product?.productName ?? '' })}</Text>
        <Text style={[styles.deleteSheetWarning, { color: colors.textSecondary }]}>{t('products.deleteModal.warning')}</Text>
        <Button variant="destructive" style={styles.deleteSheetButton} onPress={handleConfirmDelete}>
          <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.deleteModal.confirm')}</Text>
        </Button>
      </BottomSheet>
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
  deleteSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteSheetMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteSheetWarning: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteSheetButton: {
    justifyContent: 'center',
  },
});
