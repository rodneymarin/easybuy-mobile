import { forwardRef, useImperativeHandle, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

interface ProductPricesProps {
  prices: Price[];
  stores: StoreListData[];
  onPricesChange: (prices: Price[]) => void;
}

export interface ProductPricesHandle {
  confirmPendingPrice: () => void;
}

export default forwardRef<ProductPricesHandle, ProductPricesProps>(function ProductPrices({ prices, stores, onPricesChange }, ref) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [newStoreId, setNewStoreId] = useState<string | null>(null);
  const [newPriceText, setNewPriceText] = useState('');

  const usedStoreIds = new Set(prices.map((p) => p.storeId));
  const availableStores = stores.filter((s) => !usedStoreIds.has(s.id));
  const allStoresUsed = stores.length > 0 && availableStores.length === 0;

  const editingExcludedStoreIds = new Set(prices.map((p) => p.storeId));
  if (editingStoreId) editingExcludedStoreIds.delete(editingStoreId);
  const editAvailableStores = stores.filter((s) => !editingExcludedStoreIds.has(s.id));

  const currentAvailableStores = editingStoreId !== null ? editAvailableStores : availableStores;
  const storeOptions: Array<{ label: string; value: string }> = currentAvailableStores.map((s) => ({ label: s.description, value: s.id }));

  function handleRemovePrice(storeId: string) {
    onPricesChange(prices.filter((p) => p.storeId !== storeId));
  }

  function handleOpenAddPrice() {
    setEditingStoreId(null);
    setNewStoreId(null);
    setNewPriceText('');
    setIsAddingPrice(true);
  }

  function handleOpenEditPrice(price: Price) {
    setEditingStoreId(price.storeId);
    setNewStoreId(price.storeId);
    setNewPriceText(price.value.toString());
    setIsAddingPrice(false);
  }

  function handleCancelPriceForm() {
    setIsAddingPrice(false);
    setEditingStoreId(null);
    setNewStoreId(null);
    setNewPriceText('');
  }

  function handleConfirmAddPrice() {
    if (!newStoreId || !newPriceText.trim()) return;
    const value = parseFloat(newPriceText.trim());
    if (isNaN(value) || value < 0) return;
    onPricesChange([...prices, { storeId: newStoreId, value }]);
    setIsAddingPrice(false);
    setNewStoreId(null);
    setNewPriceText('');
  }

  function handleConfirmEditPrice() {
    if (!editingStoreId || !newStoreId || !newPriceText.trim()) return;
    const value = parseFloat(newPriceText.trim());
    if (isNaN(value) || value < 0) return;
    const updatedPrices = prices.map((p) =>
      p.storeId === editingStoreId ? { storeId: newStoreId, value } : p
    );
    onPricesChange(updatedPrices);
    setEditingStoreId(null);
    setNewStoreId(null);
    setNewPriceText('');
  }

  function handleSelectStore(storeId: string) {
    setNewStoreId(storeId);
  }

  const canConfirm = (() => {
    if (!newStoreId || !newPriceText.trim()) return false;
    const value = parseFloat(newPriceText.trim());
    return !isNaN(value) && value >= 0;
  })();

  useImperativeHandle(ref, () => ({
    confirmPendingPrice() {
      if (isAddingPrice && canConfirm) {
        handleConfirmAddPrice();
      } else if (editingStoreId !== null && canConfirm) {
        handleConfirmEditPrice();
      }
    },
  }), [isAddingPrice, canConfirm, editingStoreId, handleConfirmAddPrice, handleConfirmEditPrice]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('products.pricesSection')}</Text>

      {prices.length > 0 && (
        <View style={styles.pricesList}>
          {prices.map((price) => {
            const store = stores.find((s) => s.id === price.storeId);
            if (editingStoreId === price.storeId) {
              return (
                <View key={price.storeId} style={[styles.addPriceSection, { borderColor: colors.border }]}>
                  <Select value={newStoreId} onValueChange={handleSelectStore}>
                    <SelectTrigger placeholder={t('products.addModal.storePlaceholder')} label={newStoreId ? stores.find((s) => s.id === newStoreId)?.description : undefined} />
                    <SelectContent>
                      <FlatList data={storeOptions} keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                          <SelectItem label={item.label} value={item.value} />
                        )}
                      />
                    </SelectContent>
                  </Select>
                  <TextInput value={newPriceText} onChangeText={(text) => { const filtered = text.replace(/[^0-9.]/g, ''); if (filtered === '' || /^\d*\.?\d*$/.test(filtered)) setNewPriceText(filtered); }} placeholder={t('products.addModal.pricePlaceholder')} keyboardType="decimal-pad" placeholderTextColor={colors.placeholderText} style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
                  <View style={styles.addActions}>
                    <Button variant="primary" style={styles.addActionButton} onPress={handleConfirmEditPrice} disabled={!canConfirm}>
                      <Text style={styles.confirmText}>✓</Text>
                    </Button>
                    <Button variant="secondary" style={styles.addActionButton} onPress={handleCancelPriceForm}>
                      <Ionicons name="close" size={18} color={colors.text} />
                    </Button>
                  </View>
                </View>
              );
            }
            return (
              <Pressable key={price.storeId} onPress={() => handleOpenEditPrice(price)} style={[styles.priceRow, { borderColor: colors.border }]}>
                <Text style={[styles.priceStoreName, { color: colors.text }]} numberOfLines={1}>
                  {store?.description ?? price.storeId}
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>${price.value.toFixed(2)}</Text>
                <Pressable onPress={() => handleRemovePrice(price.storeId)} style={styles.removeButton} hitSlop={8}>
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}

      {isAddingPrice && editingStoreId === null ? (
        <View style={[styles.addPriceSection, { borderColor: colors.border }]}>
          <Select value={newStoreId} onValueChange={handleSelectStore}>
            <SelectTrigger placeholder={t('products.addModal.storePlaceholder')} label={newStoreId ? stores.find((s) => s.id === newStoreId)?.description : undefined} />
            <SelectContent>
              <FlatList data={storeOptions} keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <SelectItem label={item.label} value={item.value} />
                )}
              />
            </SelectContent>
          </Select>
          <TextInput value={newPriceText} onChangeText={(text) => { const filtered = text.replace(/[^0-9.]/g, ''); if (filtered === '' || /^\d*\.?\d*$/.test(filtered)) setNewPriceText(filtered); }} placeholder={t('products.addModal.pricePlaceholder')} keyboardType="decimal-pad" placeholderTextColor={colors.placeholderText} style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
          <View style={styles.addActions}>
            <Button variant="primary" style={styles.addActionButton} onPress={handleConfirmAddPrice} disabled={!canConfirm}>
              <Text style={styles.confirmText}>✓</Text>
            </Button>
            <Button variant="secondary" style={styles.addActionButton} onPress={handleCancelPriceForm}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Button>
          </View>
        </View>
      ) : editingStoreId === null && !allStoresUsed && stores.length > 0 && (
          <Button variant="secondary" style={styles.addPriceButton} onPress={handleOpenAddPrice}>
            <Ionicons name="add" size={16} color={colors.text} />
            <Text style={[styles.addPriceButtonText, { color: colors.text }]}>{t('products.addPrice')}</Text>
          </Button>
        )
      }

      {allStoresUsed && editingStoreId === null && stores.length > 0 && (
        <Text style={[styles.allUsedText, { color: colors.textSecondary }]}>{t('products.allStoresUsed')}</Text>
      )}

      {stores.length === 0 && (
        <Text style={[styles.noStoresText, { color: colors.textSecondary }]}>{t('products.noStoresAvailable')}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  pricesList: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  priceStoreName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPriceSection: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  priceInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  addActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addActionButton: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addPriceButton: {
    justifyContent: 'center',
    marginTop: 8,
  },
  addPriceButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  allUsedText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  noStoresText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },

});
