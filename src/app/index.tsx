import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShoppingList, type ShoppingListData } from '@features/shopping-lists';

const MOCK_DATA: ShoppingListData[] = [
  { id: '1', title: 'Compra', itemCount: 12, totalAmount: 156.50 },
  { id: '2', title: 'Delivery', itemCount: 5, totalAmount: 42.00 },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.header}>Listas</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar listas..."
          placeholderTextColor="#999"
        />
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Nueva</Text>
        </Pressable>
      </View>

      <ShoppingList data={MOCK_DATA} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    gap: 4,
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
