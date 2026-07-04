import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenTitle } from '@components/common/screen-title';
import { Button } from '@components/ui';
import { StoreList, type StoreListData } from '@features/stores';
import { getAllStores } from '@lib/repositories/stores';
import { useTheme } from '@lib/theme';

export default function TiendasScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreListData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const allStores = await getAllStores();
        const mapped = allStores.map((s) => ({
          id: s.id,
          description: s.description,
        }));
        setStores(mapped);
      } catch (error) {
        console.error("Failed to load stores:", error);
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
      <ScreenTitle>Tiendas</ScreenTitle>
      <View style={styles.searchRow}>
        <TextInput style={[styles.searchInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Buscar tiendas..." placeholderTextColor={colors.placeholderText} />
        <Button>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Nueva</Text>
        </Button>
      </View>
      <StoreList data={stores} />
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
