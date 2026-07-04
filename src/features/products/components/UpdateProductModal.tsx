import { useEffect, useState } from 'react';
import { FlatList, Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal, ModalTitle, ModalContent, ModalFooter, Button, Input } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { UNIT_OF_MEASUREMENT } from '@models/product.model';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';
import ProductPrices from './ProductPrices';

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productName: string, unitOfMeasurement: string, prices: Price[]) => void;
  onUpdate: (id: string, productName: string, unitOfMeasurement: string, prices: Price[]) => void;
  onDelete: (id: string) => void;
  product?: { id: string; productName: string; unitOfMeasurement: string; prices?: Price[] };
  stores: StoreListData[];
}

export default function UpdateProductModal({ isOpen, onClose, onSave, onUpdate, onDelete, product, stores }: UpdateProductModalProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [productName, setProductName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);

  const isEditMode = product !== undefined;
  const isFormValid = productName.trim().length > 0 && unitOfMeasurement.length > 0;

  const selectedUnit = UNIT_OF_MEASUREMENT.find((u) => u.id === unitOfMeasurement);

  useEffect(() => {
    if (isOpen) {
      setProductName(product?.productName ?? '');
      setUnitOfMeasurement(product?.unitOfMeasurement ?? '');
      setPrices(product?.prices ?? []);
      setIsDeleteConfirming(false);
    }
  }, [isOpen, product]);

  function handleSave() {
    if (!isFormValid) return;
    if (product) {
      onUpdate(product.id, productName.trim(), unitOfMeasurement, prices);
    } else {
      onSave(productName.trim(), unitOfMeasurement, prices);
    }
  }

  function handleDeletePress() {
    setIsDeleteConfirming(true);
  }

  function handleConfirmDelete() {
    if (!product) return;
    onDelete(product.id);
    setIsDeleteConfirming(false);
  }

  function handleCancelDelete() {
    setIsDeleteConfirming(false);
  }

  function handleClose() {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {isDeleteConfirming ? (
        <>
          <ModalTitle>{t('products.deleteModal.title')}</ModalTitle>
          <ModalContent>
            <Text style={[styles.confirmMessage, { color: colors.text }]}>{t('products.deleteModal.confirmMessage', { product: product?.productName ?? '' })}</Text>
            <Text style={[styles.warning, { color: colors.textSecondary }]}>{t('products.deleteModal.warning')}</Text>
          </ModalContent>
          <ModalFooter>
            <Button variant="secondary" style={styles.footerButton} onPress={handleCancelDelete}>
              <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('products.deleteModal.cancel')}</Text>
            </Button>
            <Button variant="destructive" style={styles.footerButton} onPress={handleConfirmDelete}>
              <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.deleteModal.confirm')}</Text>
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalTitle>{isEditMode ? t('products.edit') : t('products.add')}</ModalTitle>
          <ModalContent>
            <Input value={productName} onChangeText={setProductName} placeholder={t('products.addModal.namePlaceholder')} autoFocus returnKeyType="next" />
            <Text style={[styles.unitLabel, { color: colors.text }]}>{t('products.addModal.unitLabel')}</Text>
            <Pressable onPress={() => setIsUnitSelectorOpen(true)} style={[styles.unitSelector, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.unitSelectorText, { color: selectedUnit ? colors.text : colors.placeholderText }]}>
                {selectedUnit ? selectedUnit.label : t('products.addModal.unitLabel')}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
            </Pressable>
            <ProductPrices prices={prices} stores={stores} onPricesChange={setPrices} />
          </ModalContent>
          <ModalFooter>
            {isEditMode && (
              <Button variant="destructive" style={styles.footerButton} onPress={handleDeletePress}>
                <Text style={[styles.destructiveButtonText, { color: colors.destructiveBorder }]}>{t('products.delete')}</Text>
              </Button>
            )}
            <Button variant="secondary" style={styles.footerButton} onPress={handleClose}>
              <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>{t('products.addModal.cancel')}</Text>
            </Button>
            <Button variant="primary" style={[styles.footerButton, { opacity: isFormValid ? 1 : 0.5 }]} onPress={handleSave} disabled={!isFormValid}>
              <Text style={styles.buttonTextPrimary}>{t('products.addModal.save')}</Text>
            </Button>
          </ModalFooter>

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
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirmMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerButton: {
    flex: 1,
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
  unitLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
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
