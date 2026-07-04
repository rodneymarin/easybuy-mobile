import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface StoreFilterTag {
  id: string;
  description: string;
}

interface StoreFilterTagsProps {
  stores: StoreFilterTag[];
  selectedStoreId: string | null;
  onSelect: (storeId: string | null) => void;
}

export default function StoreFilterTags({ stores, selectedStoreId, onSelect }: StoreFilterTagsProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  function isAllSelected(): boolean {
    return selectedStoreId === null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.pill, { backgroundColor: isAllSelected() ? colors.primary : colors.surface }]}>
        <Text style={[styles.pillText, { color: isAllSelected() ? '#fff' : colors.text }]}>{t('listDetail.allStores')}</Text>
      </Pressable>
      {stores.map((store) => {
        const isActive = selectedStoreId === store.id;
        return (
          <Pressable
            key={store.id}
            onPress={() => onSelect(store.id)}
            style={[styles.pill, { backgroundColor: isActive ? colors.primary : colors.surface }]}>
            <Text style={[styles.pillText, { color: isActive ? '#fff' : colors.text }]}>{store.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
