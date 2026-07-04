import { useState } from 'react';
import { FlatList, Modal as RNModal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import type { Price } from '@models/price.model';
import type { StoreListData } from '@features/stores';

interface ProductPricesProps {
  prices: Price[];
  stores: StoreListData[];
  onPricesChange: (prices: Price[]) => void;
}

export default function ProductPrices({ prices, stores, onPricesChange }: ProductPricesProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const [newStoreId, setNewStoreId] = useState<string | null>(null);
  const [newPriceText, setNewPriceText] = useState('');

  const usedStoreIds = new Set(prices.map((p) => p.storeId));
  const availableStores = stores.filter((s) => !usedStoreIds.has(s.id));
  const allStoresUsed = stores.length > 0 && availableStores.length === 0;

  function handleRemovePrice(storeId: string) {
    onPricesChange(prices.filter((p) => p.storeId !== storeId));
  }

  function handleOpenAddPrice() {
    setNewStoreId(null);
    setNewPriceText('');
    setIsAddingPrice(true);
  }

  function handleCancelAddPrice() {
    setIsAddingPrice(false);
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

  function handleSelectStore(storeId: string) {
    setNewStoreId(storeId);
    setIsStoreSelectorOpen(false);
  }

  const canConfirm = (() => {
    if (!newStoreId || !newPriceText.trim()) return false;
    const value = parseFloat(newPriceText.trim());
    return !isNaN(value) && value >= 0;
  })();

  const selectedStore = stores.find((s) => s.id === newStoreId);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('products.pricesSection')}</Text>

      {prices.length > 0 && (
        <View style={styles.pricesList}>
          {prices.map((price) => {
            const store = stores.find((s) => s.id === price.storeId);
            return (
              <View key={price.storeId} style={[styles.priceRow, { borderColor: colors.border }]}>
                <Text style={[styles.priceStoreName, { color: colors.text }]} numberOfLines={1}>
                  {store?.description ?? price.storeId}
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>${price.value.toFixed(2)}</Text>
                <Pressable onPress={() => handleRemovePrice(price.storeId)} style={styles.removeButton} hitSlop={8}>
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {isAddingPrice ? (
        <View style={[styles.addPriceSection, { borderColor: colors.border }]}>
          <Pressable onPress={() => setIsStoreSelectorOpen(true)} style={[styles.storeSelector, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Text style={[styles.storeSelectorText, { color: newStoreId ? colors.text : colors.placeholderText }]}>
              {selectedStore ? selectedStore.description : t('products.addModal.storePlaceholder')}
            </Text>
            <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
          </Pressable>
          <TextInput value={newPriceText} onChangeText={(text) => { const filtered = text.replace(/[^0-9.]/g, ''); if (filtered === '' || /^\d*\.?\d*$/.test(filtered)) setNewPriceText(filtered); }} placeholder={t('products.addModal.pricePlaceholder')} keyboardType="decimal-pad"
            placeholderTextColor={colors.placeholderText}
            style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          />
          <View style={styles.addActions}>
            <Button variant="primary" style={styles.addActionButton}
              onPress={handleConfirmAddPrice}
              disabled={!canConfirm}
            >
              <Text style={styles.confirmText}>✓</Text>
            </Button>
            <Button variant="secondary" style={styles.addActionButton} onPress={handleCancelAddPrice}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Button>
          </View>
        </View>
      ) : (
        !allStoresUsed && stores.length > 0 && (
          <Button variant="secondary" style={styles.addPriceButton} onPress={handleOpenAddPrice}>
            <Text style={[styles.addPriceButtonText, { color: colors.text }]}>+ {t('products.addPrice')}</Text>
          </Button>
        )
      )}

      {allStoresUsed && stores.length > 0 && (
        <Text style={[styles.allUsedText, { color: colors.textSecondary }]}>{t('products.allStoresUsed')}</Text>
      )}

      {stores.length === 0 && (
        <Text style={[styles.noStoresText, { color: colors.textSecondary }]}>{t('products.noStoresAvailable')}</Text>
      )}

      <RNModal visible={isStoreSelectorOpen} transparent animationType="fade" onRequestClose={() => setIsStoreSelectorOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsStoreSelectorOpen(false)}>
          <View style={[styles.selectorModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.selectorTitle, { color: colors.text }]}>{t('products.addModal.storePlaceholder')}</Text>
            {availableStores.length > 0 ? (
              <FlatList data={availableStores} keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelectStore(item.id)} style={[styles.selectorItem, { borderColor: colors.border }]}>
                    <Text style={[styles.selectorItemText, { color: colors.text }]}>{item.description}</Text>
                  </Pressable>
                )}
              />
            ) : (
              <Text style={[styles.noStoresText, { color: colors.textSecondary }]}>{t('products.noStoresAvailable')}</Text>
            )}
          </View>
        </Pressable>
      </RNModal>
    </View>
  );
}

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
  storeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  storeSelectorText: {
    flex: 1,
    fontSize: 15,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  selectorModal: {
    borderRadius: 16,
    padding: 20,
    maxHeight: 300,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectorItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  selectorItemText: {
    fontSize: 15,
  },
});
