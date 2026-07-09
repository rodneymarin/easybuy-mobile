import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Toggle } from '@components/ui';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';

interface Store {
  id: string;
  description: string;
}

interface StoreFilterBarProps {
  visibleStores: Store[];
  hiddenStores: Store[];
  activeStoreId: string | null;
  onSelectStore: (storeId: string | null) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function StoreFilterBar({ visibleStores, hiddenStores, activeStoreId, onSelectStore, onLayout }: StoreFilterBarProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Toggle label={t('listDetail.allStores')} isSelected={activeStoreId === null} onPress={() => onSelectStore(null)} />
      {visibleStores.map((store) => (
        <Toggle key={store.id} label={store.description} isSelected={activeStoreId === store.id} onPress={() => onSelectStore(store.id)} />
      ))}
      {hiddenStores.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger style={[styles.moreToggle, { borderColor: colors.border }]}>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </DropdownMenuTrigger>
          <DropdownMenuContent cardStyle={{ minWidth: 180 }}>
            {hiddenStores.map((store) => (
              <DropdownMenuItem key={store.id} label={store.description} onSelect={() => onSelectStore(store.id)} />
            ))}
            <DropdownMenuItem label={t('listDetail.allStores')} onSelect={() => onSelectStore(null)} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  moreToggle: {
    width: 42,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});