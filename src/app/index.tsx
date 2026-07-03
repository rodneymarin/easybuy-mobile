import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ScreenTitle } from '@components/common/screen-title';
import { Button } from '@components/ui';
import { ShoppingList, type ShoppingListData } from '@features/shopping-lists';
import { getAllShoppingLists } from '@lib/repositories/shopping-lists';
import { getAllProducts } from '@lib/repositories/products';
import { calcListTotalAmount } from '@models/shopping-list.model';

export default function HomeScreen() {
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScreenTitle>Listas</ScreenTitle>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Buscar listas..." placeholderTextColor="#999" />
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
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    borderColor: '#e0e0e0',
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
