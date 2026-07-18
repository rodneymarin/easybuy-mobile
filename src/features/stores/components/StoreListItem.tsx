import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableCard } from '@components/ui/pressable-card';
import { CardTitle } from '@components/ui';
import { useTheme } from '@lib/theme';
import { getStoreColor } from '@lib/store-colors';

interface StoreListItemProps {
  id: string;
  description: string;
  color: number;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export default function StoreListItem({ id, description, color, isSelected, isSelectionMode, onPress, onLongPress }: StoreListItemProps) {
  const { colors, isDark } = useTheme();
  const resolvedColor = getStoreColor(color, isDark);

  return (
    <PressableCard onPress={() => onPress(id)} onLongPress={onLongPress ? () => onLongPress(id) : undefined}>
      <View style={styles.cardContent}>
        {isSelectionMode && (
          <>
            {isSelected ? (
              <View style={[styles.circleFilled, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            ) : (
              <View style={[styles.circleEmpty, { borderColor: colors.textSecondary }]} />
            )}
          </>
        )}
        <View style={[styles.colorDot, { backgroundColor: resolvedColor }]} />
        <CardTitle style={{ flex: 1 }}>{description}</CardTitle>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 2,
  },
  circleFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
