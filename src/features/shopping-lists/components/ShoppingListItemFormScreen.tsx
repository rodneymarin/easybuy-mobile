import { useEffect, useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, BottomSheet, Dropdown, ScreenTitle, type DropdownOption } from '@components/ui';
import { ProductFormSheet } from '@features/products/components';
import { addItemToList, updateItemInList, removeItemFromList } from '@lib/repositories/shopping-lists';
import { createProduct } from '@lib/repositories/products';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Product } from '@models/product.model';
import type { Store } from '@models/store.model';

interface ItemFormParams {
  item?: { rowId: number; productId: string; quantity: number; storeId?: string };
  shoppingListId: string;
  products: Product[];
  stores: Store[];
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ShoppingListItemFormScreen() {
  const route = useRoute<{ key: string; name: string; params: ItemFormParams }>();
  const navigation = useNavigation();
  const { item, shoppingListId, products: initialProducts, stores } = route.params;
  const { colors } = useTheme();
  const { t } = useI18n();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [quantityText, setQuantityText] = useState('1');
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [localProducts, setLocalProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const footerStyle = useMemo(() => [styles.footer, { borderTopColor: colors.border, paddingBottom: keyboardHeight + 16 }] as const, [colors.border, keyboardHeight]);

  useEffect(() => {
    setLocalProducts(initialProducts);
  }, [initialProducts]);

  const isEditMode = item !== undefined;
  const quantity = quantityText === '' ? 0 : parseFloat(quantityText);
  const isFormValid = selectedProductId !== null && !isNaN(quantity) && quantity > 0;

  const selectedProduct = localProducts.find((p) => p.id === selectedProductId);

  const unitLabel = (() => {
    if (!selectedProduct) return '';
    const label = t(`unit.${selectedProduct.unitOfMeasurement}`);
    return label !== `unit.${selectedProduct.unitOfMeasurement}` ? label : selectedProduct.unitOfMeasurement;
  })();

  const unitPrice = selectedStoreId && selectedProduct?.prices
    ? selectedProduct.prices.find((p) => p.storeId === selectedStoreId)?.value ?? 0
    : 0;

  const total = unitPrice * quantity;

  const productOptions: DropdownOption[] = localProducts.map((p) => ({ label: p.productName, value: p.id }));
  const storeOptions: DropdownOption[] = [
    { label: t('listItem.storeNone'), value: '' },
    ...stores.map((s) => ({ label: s.description, value: s.id })),
  ];

  useEffect(() => {
    if (item) {
      setSelectedProductId(item.productId);
      setSelectedStoreId(item.storeId ?? null);
      setQuantityText(String(item.quantity));
    }
  }, [item]);

  function handleQuantityChange(text: string) {
    const filtered = text.replace(/[^0-9.]/g, '');
    if (filtered === '' || /^\d*\.?\d*$/.test(filtered)) {
      setQuantityText(filtered);
    }
  }

  async function handleSave() {
    Keyboard.dismiss();
    if (!isFormValid || !selectedProductId) return;
    const qty = parseFloat(quantityText);
    if (item) {
      await updateItemInList(item.rowId, selectedProductId, qty, selectedStoreId ?? undefined);
    } else {
      await addItemToList(shoppingListId, { productId: selectedProductId, quantity: qty, storeId: selectedStoreId ?? undefined });
    }
    navigation.goBack();
  }

  function handleDeletePress() {
    Keyboard.dismiss();
    setIsDeleteSheetOpen(true);
  }

  async function handleConfirmDelete() {
    Keyboard.dismiss();
    if (!item) return;
    await removeItemFromList(item.rowId);
    setIsDeleteSheetOpen(false);
    navigation.goBack();
  }

  function handleGoBack() {
    Keyboard.dismiss();
    navigation.goBack();
  }

  async function handleCreateProduct(productName: string, unitOfMeasurement: string, prices: { storeId: string; value: number }[]) {
    const id = generateUUID();
    try {
      await createProduct(id, productName, unitOfMeasurement, prices);
      const newProduct: Product = { id, productName, unitOfMeasurement, prices };
      setLocalProducts((prev) => [...prev, newProduct]);
      setSelectedProductId(id);
      setIsProductSheetOpen(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerWrapper}>
        <ScreenTitle>{isEditMode ? t('listItem.editTitle') : t('listItem.addTitle')}</ScreenTitle>
        <Pressable onPress={handleGoBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('listItem.productLabel')}</Text>
        <View style={styles.productRow}>
          <Dropdown style={styles.productDropdown} value={selectedProductId} options={productOptions} onSelect={setSelectedProductId} placeholder={t('listItem.productPlaceholder')} />
          <Button variant="secondary" onPress={() => setIsProductSheetOpen(true)} size="icon">
            <Ionicons name="add" size={20} color={colors.text} />
          </Button>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('listItem.storeLabel')}</Text>
        <Dropdown value={selectedStoreId} options={storeOptions} onSelect={(value) => setSelectedStoreId(value || null)} placeholder={t('listItem.storePlaceholder')} />

        <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('listItem.quantityLabel')}</Text>
        <View style={styles.quantityRow}>
          <TextInput value={quantityText} onChangeText={handleQuantityChange} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.placeholderText} style={[styles.quantityInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>{unitLabel}</Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={[styles.priceLabel, { color: colors.text }]}>
            {t('listItem.unitPrice')}: {unitPrice > 0 ? `$${unitPrice.toFixed(2)}` : '---'}
          </Text>
          <Text style={[styles.priceLabel, styles.totalLabel, { color: colors.text }]}>
            {t('listItem.total')}: ${isNaN(total) ? '0.00' : total.toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <View style={footerStyle}>
        {isEditMode && (
          <Button variant="destructive" style={styles.actionButton} onPress={handleDeletePress}>
            <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('listItem.delete')}</Text>
          </Button>
        )}
        <Button variant="secondary" style={styles.actionButton} onPress={handleGoBack}>
          <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('listItem.cancel')}</Text>
        </Button>
        <Button variant="primary" style={styles.actionButton} onPress={handleSave} disabled={!isFormValid}>
          <Text style={styles.buttonTextPrimary}>{t('listItem.save')}</Text>
        </Button>
      </View>

      <BottomSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)}>
        <Text style={[styles.deleteSheetTitle, { color: colors.text }]}>{t('listItem.deleteModal.title')}</Text>
        <Text style={[styles.deleteSheetMessage, { color: colors.text }]}>{t('listItem.deleteModal.confirmMessage')}</Text>
        <Button variant="destructive" style={styles.deleteSheetButton} onPress={handleConfirmDelete}>
          <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('listItem.deleteModal.confirm')}</Text>
        </Button>
      </BottomSheet>

      <ProductFormSheet isOpen={isProductSheetOpen} stores={stores} onSave={handleCreateProduct} onClose={() => setIsProductSheetOpen(false)} />
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
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productDropdown: {
    flex: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  unitLabel: {
    fontSize: 15,
    fontWeight: '500',
    minWidth: 60,
  },
  priceInfo: {
    marginTop: 20,
    gap: 6,
  },
  priceLabel: {
    fontSize: 15,
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 17,
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
    marginBottom: 20,
  },
  deleteSheetButton: {
    justifyContent: 'center',
  },
});
