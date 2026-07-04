import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, BottomSheet, ScreenTitle } from '@components/ui';
import { ProductPrices } from '@features/products/components';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { UNIT_OF_MEASUREMENT } from '@models/product.model';
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
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  const isEditMode = product !== undefined;
  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;
  const selectedUnit = UNIT_OF_MEASUREMENT.find((u) => u.id === unitOfMeasurement);

  useEffect(() => {
    setProductName(product?.productName ?? '');
    setUnitOfMeasurement(product?.unitOfMeasurement ?? '');
    setPrices(product?.prices ?? []);
  }, [product]);

  function handleSave() {
    if (!isFormValid) return;
    if (product) {
      onUpdate(product.id, productName.trim(), unitOfMeasurement, prices);
    } else {
      onSave(productName.trim(), unitOfMeasurement, prices);
    }
  }

  function handleDeletePress() {
    setIsDeleteSheetOpen(true);
  }

  function handleConfirmDelete() {
    if (!product) return;
    onDelete(product.id);
    setIsDeleteSheetOpen(false);
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerWrapper}>
        <ScreenTitle>{isEditMode ? t('products.editTitle') : t('products.addTitle')}</ScreenTitle>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Input value={productName} onChangeText={setProductName} placeholder={t('products.addModal.namePlaceholder')} autoFocus returnKeyType="next" />
        <Text style={[styles.unitLabel, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
        <Pressable onPress={() => setIsUnitSelectorOpen(true)} style={[styles.unitSelector, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.unitSelectorText, { color: selectedUnit ? colors.text : colors.placeholderText }]}>
            {selectedUnit ? selectedUnit.label : t('products.addModal.unitLabel')}
          </Text>
          <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
        </Pressable>
        <ProductPrices prices={prices} stores={stores} onPricesChange={setPrices} />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {isEditMode && (
          <Button variant="destructive" style={styles.actionButton} onPress={handleDeletePress}>
            <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.delete')}</Text>
          </Button>
        )}
        <Button variant="secondary" style={styles.actionButton} onPress={onBack}>
          <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
        </Button>
        <Button variant="primary" style={styles.actionButton} onPress={handleSave} disabled={!isFormValid}>
          <Text style={styles.buttonTextPrimary}>{t('products.addModal.save')}</Text>
        </Button>
      </View>

      <RNModal visible={isUnitSelectorOpen} transparent animationType="fade" onRequestClose={() => setIsUnitSelectorOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsUnitSelectorOpen(false)}>
          <View style={[styles.selectorModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.selectorTitle, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
            <FlatList data={UNIT_OF_MEASUREMENT} keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => { setUnitOfMeasurement(item.id); setIsUnitSelectorOpen(false); }} style={[styles.selectorItem, { borderColor: colors.border, backgroundColor: unitOfMeasurement === item.id ? colors.surface : 'transparent' }]}>
                  <Text style={[styles.selectorItemText, { color: colors.text }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </RNModal>

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
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
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
