import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';
import { Button } from '@components/ui';
import { ShoppingList, type ShoppingListData } from '@features/shopping-lists';
import { getAllShoppingLists } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { calcListTotalAmount } from '@models/shopping-list.model';
import { useTheme } from '@lib/theme';

export default function InicioScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ShoppingListData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const shoppingLists = await getAllShoppingLists();
        const products = await getAllProducts();
        const mapped = shoppingLists.map((list) => ({
          id: list.id,
          title: list.title,
          itemCount: list.items.length,
          totalAmount: calcListTotalAmount(list, products),
        }));
        setLists(mapped);
      } catch (error) {
        console.error("Failed to load shopping lists:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTitle>Listas</ScreenTitle>
      <View style={styles.searchRow}>
        <TextInput style={[styles.searchInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Buscar listas..." placeholderTextColor={colors.placeholderText} />
        <Button>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Nueva</Text>
        </Button>
      </View>
      <ShoppingList data={lists} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 22,
  },
  addButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
